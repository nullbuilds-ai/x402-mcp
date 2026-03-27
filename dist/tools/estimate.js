import { z } from "zod";
import { decodePaymentRequired, formatUsdc, networkLabel } from "../lib/x402.js";
export const estimateSchema = z.object({
    resource_url: z.string().url().describe("URL of the x402-enabled endpoint to probe"),
    method: z.enum(["GET", "POST"]).optional().default("GET"),
});
export async function estimatePayment(input) {
    let res;
    try {
        res = await fetch(input.resource_url, {
            method: input.method,
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(10_000),
        });
    }
    catch (err) {
        return `Failed to reach ${input.resource_url}: ${err.message}`;
    }
    if (res.status !== 402) {
        return `Unexpected response: HTTP ${res.status}. This endpoint may not require payment, or may need a POST body.`;
    }
    const header = res.headers.get("PAYMENT-REQUIRED") ?? res.headers.get("payment-required");
    if (!header) {
        return `Got 402 but no PAYMENT-REQUIRED header. Non-standard x402 implementation.`;
    }
    let payload;
    try {
        payload = decodePaymentRequired(header);
    }
    catch {
        return `Got 402 but could not decode PAYMENT-REQUIRED header.`;
    }
    const accepts = payload.accepts ?? [];
    if (accepts.length === 0) {
        return `Got 402 but payment requirements are empty.`;
    }
    const lines = [
        `**Payment estimate for**: ${input.resource_url}`,
        `**Payment options** (${accepts.length}):`,
    ];
    accepts.forEach((a, i) => {
        const name = a.extra?.name ?? `Option ${i + 1}`;
        const price = a.maxAmountRequired ? formatUsdc(a.maxAmountRequired) : "unknown";
        const net = a.network ? networkLabel(a.network) : "unknown";
        lines.push(`\n### ${name}`);
        lines.push(`- Cost: **${price}** on ${net}`);
        if (a.payTo)
            lines.push(`- Recipient: ${a.payTo}`);
        if (a.description)
            lines.push(`- Description: ${a.description}`);
        if (a.maxTimeoutSeconds)
            lines.push(`- Timeout: ${a.maxTimeoutSeconds}s`);
    });
    lines.push(`\n_No payment was made. This is an estimate only._`);
    return lines.join("\n");
}
