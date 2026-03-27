const BAZAAR_URL = "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources";

export interface BazaarAccept {
  scheme: string;
  network: string;
  asset: string;
  payTo: string;
  maxAmountRequired: string;
  maxTimeoutSeconds: number;
  mimeType?: string;
  description?: string;
  outputSchema?: unknown;
  extra?: { name?: string; version?: string };
}

export interface BazaarResource {
  resource: string;
  type: string;
  x402Version: number;
  accepts: BazaarAccept[];
  lastUpdated: string;
}

export interface BazaarResponse {
  items: BazaarResource[];
}

export async function fetchResources(params: {
  limit?: number;
  offset?: number;
}): Promise<BazaarResource[]> {
  const url = new URL(BAZAAR_URL);
  url.searchParams.set("limit", String(params.limit ?? 50));
  url.searchParams.set("offset", String(params.offset ?? 0));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Bazaar API error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as BazaarResponse;
  return data.items ?? [];
}
