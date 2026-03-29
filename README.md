# x402-mcp

MCP server for the x402 payment protocol. Discover, pay, and call any x402-enabled API from Claude, Cursor, Windsurf, or any MCP-compatible client.

→ [x402mcp.app](https://x402mcp.app) · [npm](https://npmjs.com/package/@nullbuilds/x402-mcp) · [catalog](https://x402mcp.app/catalog)

---

## Install

```json
{
  "mcpServers": {
    "x402": {
      "command": "npx",
      "args": ["-y", "@nullbuilds/x402-mcp"]
    }
  }
}
```

Discovery and estimation tools work immediately with no credentials. To make paid calls, add a wallet (see below).

---

## Setting up a payment wallet

x402-mcp never stores or manages keys. You bring your own wallet.

### Option A: Private key (recommended)

The simplest path. Generate a dedicated wallet just for x402 payments — not your main one.

**1. Generate a wallet**

Use any ETH wallet generator. With Foundry's cast:
```bash
cast wallet new
```

Or use [app.coinbase.com](https://app.coinbase.com), [MetaMask](https://metamask.io), or [Rainbow](https://rainbow.me) to create a new address.

**2. Fund it with USDC on Base**

Send $5–10 USDC to the address on the Base network. From Coinbase: withdraw → select Base network → USDC.

A few dollars covers hundreds of API calls (most x402 APIs are $0.001–$0.01 per call).

**3. Add to your MCP config**

```json
{
  "mcpServers": {
    "x402": {
      "command": "npx",
      "args": ["-y", "@nullbuilds/x402-mcp"],
      "env": {
        "X402_PRIVATE_KEY": "0x..."
      }
    }
  }
}
```

Use a dedicated wallet with a small balance. If the key is ever exposed, worst case you lose your spending float — not your main holdings.

### Option B: Coinbase CDP (key never on your machine)

CDP uses a hardware-backed TEE — the private key is generated and stored in Coinbase's secure enclave, never on your device.

**1.** Go to [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com) and create a project
**2.** Generate an API key (gets you `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`)
**3.** Create a Server Wallet (gets you `CDP_WALLET_SECRET`)
**4.** Add to your MCP config:

```json
{
  "mcpServers": {
    "x402": {
      "command": "npx",
      "args": ["-y", "@nullbuilds/x402-mcp"],
      "env": {
        "CDP_API_KEY_ID": "your-key-id",
        "CDP_API_KEY_SECRET": "your-key-secret",
        "CDP_WALLET_SECRET": "your-wallet-secret"
      }
    }
  }
}
```

**5.** Ask your agent: `"What's my x402 wallet address?"` — then fund that address with USDC on Base.

---

## Tools

| Tool | Needs wallet | What it does |
|------|:------------:|--------------|
| `discover_paid_services` | No | Browse 957 verified x402 APIs. Filter by keyword or network. |
| `get_service_details` | No | Full payment requirements for any x402 URL. |
| `estimate_payment` | No | Probe a URL for x402 cost without paying. |
| `check_wallet_balance` | No | USDC balance for any address on Base. |
| `make_x402_request` | Yes | Pay and call any x402 API in one shot. |
| `get_my_wallet` | Yes | Your wallet address and setup instructions. |
| `get_payment_history` | Yes | Recent payment history. |

---

## Example

```
"Find me a weather API and get current conditions in San Francisco"
"What's the median household income for ZIP code 90210?"
"Vet this name against the OFAC sanctions list"
"Decode this VIN: 1HGBH41JXMN109186"
```

The agent discovers the API, estimates cost, pays if within your cap, returns the result.

---

## Catalog

957 verified live x402 APIs across Weather, Finance, Location, Government, and Identity. Probed from 13,334 candidates. Reverified nightly.

Browse at [x402mcp.app/catalog](https://x402mcp.app/catalog) or download [catalog.json](https://x402mcp.app/catalog.json).

---

## FAQ

**Do I need a wallet to try it?**
No. Discovery, estimation, and balance tools work with zero credentials.

**How do I control spending?**
Pass `max_cost_usdc` on every paid call. The request aborts before payment if the API costs more than your cap.

**Does x402-mcp take a cut?**
No. Payments go directly from your wallet to the API provider.

**What if a payment fails?**
If signing fails, no payment is sent. If the API returns an error after payment, the error is returned and logged.

---

## Roadmap

- [x] Discover, estimate, balance check (v0.1)
- [x] Paid calls via CDP Server Wallet (v0.2)
- [x] Curated live catalog, updated nightly (v0.3)
- [x] Payment history, wallet info (v0.4)
- [x] Private key wallet support (v0.5)
- [ ] Multi-network support (Ethereum, Polygon, Solana)
- [ ] Session-level spend limits

---

## License

MIT. Built by [@nullbuilds](https://x.com/nullbuilds).
