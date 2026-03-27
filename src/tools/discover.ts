import { z } from "zod";
import { fetchResources } from "../lib/bazaar.js";
import { formatUsdc, networkLabel } from "../lib/x402.js";

export const discoverSchema = z.object({
  query: z.string().optional().describe("Search term to filter services by name or description"),
  network: z.string().optional().describe("Filter by network, e.g. 'base', 'solana', 'ethereum'"),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type DiscoverInput = z.infer<typeof discoverSchema>;

export async function discoverPaidServices(input: DiscoverInput): Promise<string> {
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
