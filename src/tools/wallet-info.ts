import { hasWallet, getSignerAccount } from "../lib/wallet.js";

const SETUP_GUIDE = [
  "No wallet configured. x402-mcp never stores or manages keys — you bring your own.",
  "",
  "Option A — Dedicated private key (recommended for most developers):",
  "  1. Generate a fresh wallet at app.coinbase.com or use `cast wallet new`",
  "  2. Send $5-10 USDC on Base to that address (coinbase.com → send → Base network)",
  "  3. Add to your MCP config env:",
  '     "X402_PRIVATE_KEY": "0x..."',
  "",
  "  Use a dedicated wallet, not your main one. Treat it like a prepaid API balance.",
  "",
  "Option B — Coinbase CDP (key never on your machine):",
  "  1. Go to portal.cdp.coinbase.com, create a project",
  "  2. Generate an API key and server wallet",
  "  3. Add to your MCP config env:",
  '     "CDP_API_KEY_ID": "...",',
  '     "CDP_API_KEY_SECRET": "...",',
  '     "CDP_WALLET_SECRET": "..."',
].join("\n");

export async function getMyWallet(): Promise<string> {
  if (!hasWallet()) {
    return SETUP_GUIDE;
  }

  const signer = await getSignerAccount();
  return [
    `Your x402-mcp wallet: ${signer.address}`,
    "",
    "Fund it with USDC on Base before making paid API calls.",
    `Check balance: check_wallet_balance({ wallet_address: "${signer.address}" })`,
  ].join("\n");
}
