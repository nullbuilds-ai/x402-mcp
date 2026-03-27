const BAZAAR_URL = "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources";
export async function fetchResources(params) {
    const url = new URL(BAZAAR_URL);
    url.searchParams.set("limit", String(params.limit ?? 50));
    url.searchParams.set("offset", String(params.offset ?? 0));
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Bazaar API error: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json());
    return data.items ?? [];
}
