import { mkdirSync, appendFileSync, readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const DIR = join(homedir(), ".x402-mcp");
const FILE = join(DIR, "history.jsonl");

export interface PaymentRecord {
  ts: string;
  resource: string;
  amount_usdc: string;
  amount_raw: string;
  network: string;
  wallet: string;
  status: "success" | "failed";
  http_status?: number;
}

export function logPayment(record: PaymentRecord): void {
  try {
    mkdirSync(DIR, { recursive: true });
    appendFileSync(FILE, JSON.stringify(record) + "\n", "utf8");
  } catch {
    // Non-fatal — don't break payments if logging fails
  }
}

export function readHistory(limit = 50): PaymentRecord[] {
  if (!existsSync(FILE)) return [];
  try {
    const lines = readFileSync(FILE, "utf8").trim().split("\n").filter(Boolean);
    const records = lines
      .map((l) => { try { return JSON.parse(l) as PaymentRecord; } catch { return null; } })
      .filter(Boolean) as PaymentRecord[];
    return records.slice(-limit).reverse(); // most recent first
  } catch {
    return [];
  }
}
