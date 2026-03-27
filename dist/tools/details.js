import { z } from "zod";
import { fetchResources } from "../lib/bazaar.js";
import { formatUsdc, networkLabel } from "../lib/x402.js";
export const detailsSchema = z.object({
    resource_url: z.string().url().describe("The exact URL of the x402-enabled resource"),
});
export async function getServiceDetails(input) {
    // Fetch a large page and find the matching resource
    const resources = await fetchResources({ limit: 100 });
    const match = resources.find((r) => r.resource === input.resource_url);
    if (!match) {
        return `Resource not found in Bazaar catalog: ${input.resource_url}\n\nTip: Use discover_paid_services to find valid resource URLs.`;
    }
    const lines = [
        `**Resource**: ${match.resource}`,
        `**Protocol Version**: x402 v${match.x402Version}`,
        `**Last Updated**: ${match.lastUpdated}`,
        ``,
        `**Payment Options** (${match.accepts.length}):`,
    ];
    match.accepts.forEach((a, i) => {
        const name = a.description?.slice(0, 40) ?? `Option ${i + 1}`;
        lines.push(`\n### ${name}`);
        lines.push(`- Network: ${networkLabel(a.network)}`);
        lines.push(`- Max Cost: ${formatUsdc(a.maxAmountRequired)}`);
        lines.push(`- Timeout: ${a.maxTimeoutSeconds}s`);
        lines.push(`- Scheme: ${a.scheme}`);
        lines.push(`- Pay To: ${a.payTo}`);
        if (a.description)
            lines.push(`- Description: ${a.description}`);
        if (a.mimeType)
            lines.push(`- Response Type: ${a.mimeType}`);
    });
    return lines.join("\n");
}
