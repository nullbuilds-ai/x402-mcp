import { z } from "zod";
import { fetchResources } from "../lib/bazaar.js";
import { formatUsdc, networkLabel } from "../lib/x402.js";

const CATALOG_URL = "https://x402mcp.app/catalog.json";

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

interface Catalog {
  generated_at: string;
  total_tested: number;
  total_live: number;
  services: CatalogEntry[];
}

export const discoverSchema = z.object({
  query: z.string().optional().describe("Search term to filter services by name or description"),
  network: z.string().optional().describe("Filter by network, e.g. 'base', 'solana', 'ethereum'"),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type DiscoverInput = z.infer<typeof discoverSchema>;

async function fetchCatalog(): Promise<Catalog | null> {
  try {
    const res = await fetch(CATALOG_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.json() as Catalog;
  } catch {
    return null;
  }
}

export async function discoverPaidServices(input: DiscoverInput): Promise<string> {
  const catalog = await fetchCatalog();

  if (catalog) {
    let services = catalog.services.filter((s) => s.live);

    if (input.query) {
      const q = input.query.toLowerCase();
      services = services.filter((s) =>
        s.resource.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    if (input.network) {
      const n = input.network.toLowerCase();
      services = services.filter((s) => s.network.toLowerCase().includes(n));
    }

    const total = services.length;
    services = services.slice(input.offset, input.offset + input.limit);

    if (services.length === 0) {
      return "No verified services found matching your criteria.";
    }

    const lines = services.map((s) => {
      const hostname = new URL(s.resource).hostname;
      const net = networkLabel(s.network);
      const desc = s.description || "(no description)";
      return `- **${hostname}** (${net}, ${s.price_usdc})\n  URL: ${s.resource}\n  ${desc}`;
    });

    const meta = `Found ${services.length} verified service(s)${total > services.length ? ` (${total} total, showing ${input.offset + 1}–${input.offset + services.length})` : ""}:`;
    return `${meta}\n\n${lines.join("\n\n")}`;
  }

  // Fall back to raw Bazaar if catalog unavailable
  let resources = await fetchResources({ limit: 100, offset: input.offset });

  if (input.query) {
    const q = input.query.toLowerCase();
    resources = resources.filter((r) => {
      const name = r.accepts[0]?.extra?.name ?? "";
      const desc = r.accepts[0]?.description ?? "";
      return (
        r.resource.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q)
      );
    });
  }

  if (input.network) {
    const n = input.network.toLowerCase();
    resources = resources.filter((r) =>
      r.accepts.some((a) => a.network.toLowerCase().includes(n))
    );
  }

  resources = resources.slice(0, input.limit);

  if (resources.length === 0) {
    return "No services found matching your criteria.";
  }

  const lines = resources.map((r) => {
    const accept = r.accepts[0];
    const desc = accept?.description ?? "(no description)";
    const price = accept ? formatUsdc(accept.maxAmountRequired) : "unknown";
    const net = accept ? networkLabel(accept.network) : "unknown";
    const hostname = new URL(r.resource).hostname;
    return `- **${hostname}** (${net}, ${price})\n  URL: ${r.resource}\n  ${desc}`;
  });

  return `Found ${resources.length} service(s):\n\n${lines.join("\n\n")}`;
}
