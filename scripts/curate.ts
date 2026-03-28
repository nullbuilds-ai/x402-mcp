#!/usr/bin/env tsx
/**
 * x402 Bazaar curation script
 * Fetches all services from Bazaar, probes each endpoint for live 402,
 * scores them, and outputs catalog.json.
 *
 * Usage:
 *   npx tsx scripts/curate.ts [--out ./catalog.json] [--concurrency 20]
 */

import { writeFileSync } from "fs";

const BAZAAR_BASE = "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources";
const PAGE_SIZE = 100;
const DEFAULT_CONCURRENCY = 20;
const PROBE_TIMEOUT_MS = 8000;

interface BazaarAccept {
  scheme: string;
  network: string;
  asset: string;
  payTo: string;
  maxAmountRequired: string;
  maxTimeoutSeconds: number;
  description?: string;
  mimeType?: string;
  extra?: Record<string, unknown>;
}

interface BazaarItem {
  resource: string;
  type: string;
  x402Version: number;
  accepts: BazaarAccept[];
  lastUpdated: string;
}

interface CatalogEntry {
  resource: string;
  description: string;
  network: string;
  price_usdc: string;
  price_raw: string;
  pay_to: string;
  scheme: string;
  x402_version: number;
  live: boolean;
  score: number;
  last_checked: string;
}

function formatUsdc(raw: string): string {
  try {
    const n = BigInt(raw);
    const whole = n / 1_000_000n;
    const frac = n % 1_000_000n;
    return `${whole}.${frac.toString().padStart(6, "0")} USDC`;
  } catch {
    return `${raw} (raw)`;
  }
}

function networkLabel(network: string): string {
  const map: Record<string, string> = {
    "eip155:8453": "Base",
    "eip155:84532": "Base Sepolia",
    "eip155:1": "Ethereum",
    "eip155:137": "Polygon",
    "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": "Solana",
  };
  return map[network] ?? network;
}

async function fetchAllBazaar(): Promise<BazaarItem[]> {
  const all: BazaarItem[] = [];
  let offset = 0;
  let page = 0;

  while (true) {
    const url = `${BAZAAR_BASE}?limit=${PAGE_SIZE}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Bazaar fetch failed: ${res.status}`);
    const data = await res.json() as { items?: BazaarItem[] };
    const items = data.items ?? [];
    if (items.length === 0) break;
    all.push(...items);
    process.stderr.write(`\rFetched ${all.length} services from Bazaar...`);
    if (items.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
    page++;
    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 100));
  }

  process.stderr.write(`\rFetched ${all.length} total services from Bazaar.\n`);
  return all;
}

async function probeEndpoint(item: BazaarItem): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(item.resource, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);
    // Valid x402 endpoint returns 402 with PAYMENT-REQUIRED header
    if (res.status === 402) {
      const header = res.headers.get("PAYMENT-REQUIRED") ?? res.headers.get("payment-required");
      return !!header;
    }
    return false;
  } catch {
    return false;
  }
}

function scoreItem(item: BazaarItem, live: boolean): number {
  let score = 0;
  if (live) score += 3;

  const accept = item.accepts[0];
  if (!accept) return score;

  // Has a real description
  if (accept.description && accept.description.length > 15) score += 1;

  // Base mainnet preferred
  if (accept.network === "eip155:8453") score += 1;

  // Reasonable price (under 1 USDC)
  try {
    const price = BigInt(accept.maxAmountRequired);
    if (price <= 1_000_000n) score += 1;
  } catch { /* skip */ }

  return score;
}

async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  concurrency: number
): Promise<void> {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
}

async function main() {
  const args = process.argv.slice(2);
  const outPath = args[args.indexOf("--out") + 1] ?? "./catalog.json";
  const concurrency = parseInt(args[args.indexOf("--concurrency") + 1] ?? String(DEFAULT_CONCURRENCY));

  process.stderr.write(`Starting curation with concurrency=${concurrency}\n`);

  const items = await fetchAllBazaar();
  const total = items.length;
  let tested = 0;
  let live = 0;

  const results: CatalogEntry[] = [];

  await runWithConcurrency(items, async (item) => {
    const isLive = await probeEndpoint(item);
    const accept = item.accepts[0];

    tested++;
    if (isLive) live++;

    if (tested % 50 === 0) {
      process.stderr.write(`\rProbed ${tested}/${total} — ${live} live...`);
    }

    const score = scoreItem(item, isLive);

    results.push({
      resource: item.resource,
      description: accept?.description ?? "",
      network: accept?.network ?? "",
      price_usdc: accept ? formatUsdc(accept.maxAmountRequired) : "",
      price_raw: accept?.maxAmountRequired ?? "",
      pay_to: accept?.payTo ?? "",
      scheme: accept?.scheme ?? "",
      x402_version: item.x402Version,
      live: isLive,
      score,
      last_checked: new Date().toISOString(),
    });
  }, concurrency);

  process.stderr.write(`\nDone. ${live}/${total} endpoints are live.\n`);

  // Sort by score descending, then by network (Base mainnet first)
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.network === "eip155:8453" && b.network !== "eip155:8453") return -1;
    if (b.network === "eip155:8453" && a.network !== "eip155:8453") return 1;
    return 0;
  });

  const catalog = {
    generated_at: new Date().toISOString(),
    total_tested: total,
    total_live: live,
    services: results,
  };

  writeFileSync(outPath, JSON.stringify(catalog, null, 2));
  process.stderr.write(`Catalog written to ${outPath}\n`);

  // Print summary
  const byNetwork: Record<string, number> = {};
  for (const r of results.filter((r) => r.live)) {
    const label = networkLabel(r.network);
    byNetwork[label] = (byNetwork[label] ?? 0) + 1;
  }
  process.stderr.write("\nLive services by network:\n");
  for (const [net, count] of Object.entries(byNetwork).sort((a, b) => b[1] - a[1])) {
    process.stderr.write(`  ${net}: ${count}\n`);
  }
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
