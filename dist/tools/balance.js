import { z } from "zod";
import { createPublicClient, http, formatUnits, isAddress } from "viem";
import { base } from "viem/chains";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const ERC20_ABI = [
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
];
export const balanceSchema = z.object({
    wallet_address: z.string().describe("Wallet address (0x...) or ENS name"),
});
export async function checkWalletBalance(input) {
    const client = createPublicClient({
        chain: base,
        transport: http(),
    });
    let address;
    if (input.wallet_address.endsWith(".eth")) {
        try {
            // ENS resolution via mainnet
            const { createPublicClient: mkClient, http: h } = await import("viem");
            const { mainnet } = await import("viem/chains");
            const ensClient = mkClient({ chain: mainnet, transport: h() });
            const resolved = await ensClient.getEnsAddress({ name: input.wallet_address });
            if (!resolved) {
                return `Could not resolve ENS name: ${input.wallet_address}`;
            }
            address = resolved;
        }
        catch {
            return `ENS resolution failed for ${input.wallet_address}`;
        }
    }
    else if (isAddress(input.wallet_address)) {
        address = input.wallet_address;
    }
    else {
        return `Invalid address: ${input.wallet_address}. Provide a 0x address or ENS name.`;
    }
    const raw = await client.readContract({
        address: USDC_BASE,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
    });
    const formatted = formatUnits(raw, 6);
    const display = parseFloat(formatted).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    });
    return `**USDC balance on Base**\nAddress: ${address}\nBalance: **${display} USDC**\n\n_Read-only. No wallet connection required._`;
}
