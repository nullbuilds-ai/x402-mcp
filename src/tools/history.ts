import { z } from "zod";
import { readHistory } from "../lib/history.js";

export const historySchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type HistoryInput = z.infer<typeof historySchema>;

export async function getPaymentHistory(input: HistoryInput): Promise<string> {
  const records = readHistory(input.limit);

  if (records.length === 0) {
    return "No payment history yet. Use make_x402_request to call a paid API.";
  }

  const totalPaid = records
    .filter((r) => r.status === "success")
    .reduce((sum, r) => {
      try { return sum + Number(BigInt(r.amount_raw)) / 1_000_000; } catch { return sum; }
    }, 0);

  const lines = records.map((r) => {
    const date = new Date(r.ts).toLocaleString();
    const host = new URL(r.resource).hostname;
    const status = r.status === "success" ? "✓" : "✗";
    return `${status} ${date}  ${r.amount_usdc}  ${host}\n  ${r.resource}`;
  });

  return [
    `Payment history (${records.length} records, total spent: ${totalPaid.toFixed(6)} USDC):`,
    "",
    ...lines,
  ].join("\n");
}
