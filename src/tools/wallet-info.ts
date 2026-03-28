import { getWallet, hasCdpCredentials } from "../lib/wallet.js";

export async function getMyWallet(): Promise<string> {
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

  const account = await getWallet();
  return [
    `Your x402-mcp wallet address: ${account.address}`,
    "",
    "This wallet is used for all make_x402_request payments.",
    "Fund it with USDC on Base before making paid API calls.",
    "",
    `Check balance: check_wallet_balance({ wallet_address: "${account.address}" })`,
  ].join("\n");
}
