# x402-mcp

**x402, without the plumbing.**

MCP server for the x402 payment protocol. Discover, pay, and call any x402-enabled API from Claude Desktop, Cursor, Windsurf, or any MCP-compatible client. Payment handled automatically — no API keys, no signups, no billing accounts.

→ [x402mcp.app](https://x402mcp.app) · [npm](https://npmjs.com/package/@nullbuilds/x402-mcp) · [catalog](https://x402mcp.app/catalog)

---

## Install

Add to your MCP client config:

```json
{
  "mcpServers": {
    "x402": {
      "command": "npx",
      "args": ["@nullbuilds/x402-mcp"]
    }
  }
}
```

**Claude Desktop config location:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Read-only tools (`discover_paid_services`, `estimate_payment`, `check_wallet_balance`) work immediately with no credentials.

To make paid calls, add CDP credentials:

```json
{
  "mcpServers": {
    "x402": {
      "command": "npx",
      "args": ["@nullbuilds/x402-mcp"],
      "env": {
        "CDP_API_KEY_ID": "your-key-id",
        "CDP_API_KEY_SECRET": "your-key-secret",
        "CDP_WALLET_SECRET": "your-wallet-secret"
      }
    }
  }
}
```

Get CDP credentials at [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com). Fund your wallet with USDC on Base, then ask your agent for its wallet address with `get_my_wallet`.

---

## Tools

| Tool | Needs credentials | What it does |
|------|:-----------------:|--------------|
| `discover_paid_services` | No | Browse 959 verified x402 APIs. Filter by keyword or network. |
| `get_service_details` | No | Full payment requirements for any x402 URL. |
| `estimate_payment` | No | Probe a URL for x402 cost without paying. |
| `check_wallet_balance` | No | USDC balance for any address on Base. |
| `make_x402_request` | Yes | Pay and call any x402 API in one shot. Handles 402, signs, retries, returns data. |
| `get_my_wallet` | Yes | Your CDP wallet address. Fund this before making paid calls. |
| `get_payment_history` | Yes | Recent payment history with running totals. |

---

## How it works

1. Your agent calls `make_x402_request` with a URL and a `max_cost_usdc` cap
2. The server returns HTTP 402 — x402-mcp reads the price and recipient
3. An EIP-3009 USDC transfer is signed via Coinbase CDP (TEE — your private key never touches this machine)
4. The request retries with a `PAYMENT` header — the API verifies on-chain and returns data
5. Payment is logged to `~/.x402-mcp/history.jsonl`

Total overhead: ~200–400ms per call.

---

## Example

```
Ask your agent:

"Find me a weather API and check the current conditions in San Francisco"
"What's the median household income for ZIP code 90210?"
"Vet this counterparty name against the OFAC sanctions list"
"Decode this VIN: 1HGBH41JXMN109186"
```

The agent discovers the right API, estimates the cost, pays if within your cap, and returns the result.

---

## Catalog

959 verified live x402 APIs across Weather, Finance, Location, Government, and Identity categories. Probed from 13,334 candidates. Reverified nightly.

Browse at [x402mcp.app/catalog](https://x402mcp.app/catalog) or download [catalog.json](https://x402mcp.app/catalog.json).

---

## FAQ

**Do I need a wallet to try it?**
No. Three tools work with zero credentials. Add CDP keys when you're ready to pay.

**What if a payment fails?**
If signing fails, no payment is sent. If the API returns an error after payment, the error is returned and logged. You're never charged twice.

**How do I control spending?**
Pass `max_cost_usdc` on every call. The request aborts before payment if the API costs more than your cap.

**Can I use my own wallet?**
Not yet. CDP Server Wallets only for now. Bring-your-own-key is on the roadmap.

**Does x402-mcp take a cut?**
No. Payments go directly from your CDP wallet to the API provider.

---

## Roadmap

- [x] discover, estimate, balance (v0.1)
- [x] make_x402_request via CDP Server Wallet (v0.2)
- [x] Curated live catalog, updated nightly (v0.3)
- [x] get_my_wallet, get_payment_history, payment logging (v0.4)
- [ ] Multi-network support (Ethereum, Polygon, Solana)
- [ ] Session-level spend limits
- [ ] Bring-your-own-key wallet support

---

## License

MIT. Built by [@nullbuilds](https://x.com/nullbuilds).
