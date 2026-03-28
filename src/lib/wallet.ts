import { CdpClient } from "@coinbase/cdp-sdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _account: any | null = null;

export function hasCdpCredentials(): boolean {
  return !!(
    process.env.CDP_API_KEY_ID &&
    process.env.CDP_API_KEY_SECRET &&
    process.env.CDP_WALLET_SECRET
  );
}

export async function getWallet() {
  if (!hasCdpCredentials()) {
    throw new Error(
      "CDP credentials not configured. Set CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET in your MCP server env."
    );
  }
  if (_account) return _account;
  const cdp = new CdpClient();
  _account = await cdp.evm.getOrCreateAccount({ name: "x402-mcp-wallet" });
  return _account;
}
