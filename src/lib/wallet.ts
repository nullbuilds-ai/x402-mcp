import { CdpClient } from "@coinbase/cdp-sdk";
import { privateKeyToAccount } from "viem/accounts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _cdpAccount: any | null = null;

export function hasCdpCredentials(): boolean {
  return !!(
    process.env.CDP_API_KEY_ID &&
    process.env.CDP_API_KEY_SECRET &&
    process.env.CDP_WALLET_SECRET
  );
}

export function hasLocalKey(): boolean {
  const key = process.env.X402_PRIVATE_KEY;
  return !!(key && key.startsWith("0x") && key.length === 66);
}

export function hasWallet(): boolean {
  return hasCdpCredentials() || hasLocalKey();
}

export async function getWallet() {
  if (!hasCdpCredentials()) {
    throw new Error(
      "CDP credentials not configured. Set CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET."
    );
  }
  if (_cdpAccount) return _cdpAccount;
  const cdp = new CdpClient();
  _cdpAccount = await cdp.evm.getOrCreateAccount({ name: "x402-mcp-wallet" });
  return _cdpAccount;
}

export async function getSignerAccount(): Promise<{
  address: `0x${string}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTypedData: (msg: any) => Promise<`0x${string}`>;
}> {
  if (hasCdpCredentials()) {
    const account = await getWallet();
    return {
      address: account.address as `0x${string}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signTypedData: (msg: any) => account.signTypedData(msg as any),
    };
  }

  if (hasLocalKey()) {
    const key = process.env.X402_PRIVATE_KEY as `0x${string}`;
    const account = privateKeyToAccount(key);
    return {
      address: account.address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signTypedData: (msg: any) => account.signTypedData(msg),
    };
  }

  throw new Error("No wallet configured.");
}
