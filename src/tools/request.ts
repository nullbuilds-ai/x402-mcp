import { z } from "zod";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm";
import { formatUsdc } from "../lib/x402.js";
import { getWallet, hasCdpCredentials } from "../lib/wallet.js";
import { logPayment } from "../lib/history.js";
import type { PaymentRequirements, PaymentRequirementsV1 } from "@x402/core/types";

export const requestSchema = z.object({
  resource_url: z.string().url().describe("URL of the x402-enabled API to call"),
  method: z.enum(["GET", "POST"]).default("GET").describe("HTTP method (default GET)"),
  body: z.string().optional().describe("JSON body for POST requests"),
  max_cost_usdc: z
    .number()
    .positive()
    .default(1.0)
    .describe("Maximum USDC cost to allow (default 1.0). Aborts if cost exceeds this."),
});

export type RequestInput = z.infer<typeof requestSchema>;

// Base mainnet CAIP-2 network identifier
const BASE_NETWORK = "eip155:8453" as const;

// Get the cost amount from either v1 or v2 payment requirements
function getAmount(req: PaymentRequirements | PaymentRequirementsV1): string {
  if ("maxAmountRequired" in req) return req.maxAmountRequired;
  return req.amount;
}

export async function makeX402Request(input: RequestInput): Promise<string> {
  if (!hasCdpCredentials()) {
    return [
      "CDP credentials not configured.",
      "",
      "Add to your Claude Desktop config:",
      '  "env": {',
      '    "CDP_API_KEY_ID": "your-key-id",',
      '    "CDP_API_KEY_SECRET": "your-key-secret",',
      '    "CDP_WALLET_SECRET": "your-wallet-secret"',
      "  }",
      "",
      "Get credentials at portal.cdp.coinbase.com",
    ].join("\n");
  }

  // Step 1: Initial request — expect 402
  const fetchOptions: RequestInit = {
    method: input.method,
    headers: { "Content-Type": "application/json" },
  };
  if (input.body && input.method === "POST") {
    fetchOptions.body = input.body;
  }

  const initialRes = await fetch(input.resource_url, fetchOptions);

  if (initialRes.status !== 402) {
    const text = await initialRes.text();
    return `Response (${initialRes.status}):\n${text}`;
  }

  // Step 2: Parse PAYMENT-REQUIRED header
  const baseClient = new x402Client();
  const httpClient = new x402HTTPClient(baseClient);
  const paymentRequired = httpClient.getPaymentRequiredResponse(
    (name) => initialRes.headers.get(name)
  );

  // Step 3: Find a Base mainnet option and check cost
  const baseOptions = paymentRequired.accepts.filter(
    (a) => a.network === BASE_NETWORK
  );

  if (baseOptions.length === 0) {
    const networks = [...new Set(paymentRequired.accepts.map((a) => a.network))];
    return [
      "No Base mainnet payment option found for this resource.",
      `Available networks: ${networks.join(", ")}`,
      "",
      "Only Base (eip155:8453) is supported in v0.2.",
    ].join("\n");
  }

  // Pick cheapest Base option
  const cheapest = baseOptions.reduce((prev, curr) =>
    BigInt(getAmount(curr)) < BigInt(getAmount(prev)) ? curr : prev
  );

  const amountRaw = getAmount(cheapest);
  const costUsdc = Number(BigInt(amountRaw)) / 1_000_000;
  if (costUsdc > input.max_cost_usdc) {
    return [
      "Cost exceeds limit. Aborting.",
      "",
      `Required: ${formatUsdc(amountRaw)}`,
      `Your limit: ${input.max_cost_usdc.toFixed(6)} USDC`,
      "",
      `Call again with max_cost_usdc: ${costUsdc} to proceed.`,
    ].join("\n");
  }

  // Step 4: Get CDP wallet and create ClientEvmSigner adapter
  const account = await getWallet();

  const signer = {
    address: account.address as `0x${string}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signTypedData: (msg: any) => account.signTypedData(msg as any),
  };

  // Step 5: Build x402 client with ExactEvmScheme registered for Base
  const scheme = new ExactEvmScheme(signer);
  const client = new x402Client();
  client.register(BASE_NETWORK, scheme);
  const httpClientWithScheme = new x402HTTPClient(client);

  // Step 6: Create payment payload
  const paymentPayload = await client.createPaymentPayload(paymentRequired);

  // Step 7: Encode payment header
  const paymentHeaders = httpClientWithScheme.encodePaymentSignatureHeader(paymentPayload);

  // Step 8: Retry with payment
  const paidRes = await fetch(input.resource_url, {
    ...fetchOptions,
    headers: {
      ...(fetchOptions.headers as Record<string, string>),
      ...paymentHeaders,
    },
  });

  const responseText = await paidRes.text();

  const record = {
    ts: new Date().toISOString(),
    resource: input.resource_url,
    amount_usdc: formatUsdc(amountRaw),
    amount_raw: amountRaw,
    network: cheapest.network,
    wallet: account.address,
    status: paidRes.ok ? "success" as const : "failed" as const,
    http_status: paidRes.status,
  };
  logPayment(record);

  if (!paidRes.ok) {
    return [
      `Payment sent but request failed (${paidRes.status}).`,
      `Cost: ${formatUsdc(amountRaw)}`,
      `Wallet: ${account.address}`,
      "",
      "Response:",
      responseText,
    ].join("\n");
  }

  let body: string;
  try {
    body = JSON.stringify(JSON.parse(responseText), null, 2);
  } catch {
    body = responseText;
  }

  return [
    `Success. Paid ${formatUsdc(amountRaw)} from ${account.address}`,
    "",
    body,
  ].join("\n");
}
