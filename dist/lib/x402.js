// USDC has 6 decimals. Amount comes as raw string.
export function formatUsdc(raw) {
    const n = BigInt(raw);
    const whole = n / 1000000n;
    const frac = n % 1000000n;
    if (frac === 0n)
        return `${whole} USDC`;
    const fracStr = frac.toString().padStart(6, "0").replace(/0+$/, "");
    return `${whole}.${fracStr} USDC`;
}
// Parse the PAYMENT-REQUIRED header (base64-encoded JSON).
export function decodePaymentRequired(header) {
    const json = Buffer.from(header, "base64").toString("utf-8");
    return JSON.parse(json);
}
export function networkLabel(network) {
    const map = {
        "eip155:8453": "Base",
        "eip155:84532": "Base Sepolia",
        "eip155:1": "Ethereum",
        "eip155:137": "Polygon",
        "solana": "Solana",
        "solana:mainnet": "Solana",
    };
    return map[network] ?? network;
}
