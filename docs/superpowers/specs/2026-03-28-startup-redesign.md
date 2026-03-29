# x402-mcp Site Redesign — Startup Positioning

**Date:** 2026-03-28
**Status:** Approved for implementation

## Goal

Reposition x402mcp.app from "open source developer tool" to "startup product with a business model." Keep the dark/green aesthetic. Don't break the catalog or existing SEO.

## Business Model

- **Free forever** for all read-only tools (discover, estimate, balance check) and BYOW (bring your own CDP wallet)
- **Hosted wallet (coming soon):** 0.5% of agent transaction volume routed through the x402-mcp hosted wallet — no monthly fee, no seats, no tiers
- Revenue grows with agent usage; aligns incentives with x402 philosophy

## Hero

**Headline:** "The payment layer for AI agents."
**Subhead:** "Agents earn. Agents pay. x402-mcp handles the wallet, the signing, and the settlement — automatically. Connect to 957 live paid APIs from any MCP client."
**Primary CTA:** "Start free" (links to install docs / npx command)
**Secondary CTA:** "View catalog →"
**Sub-caption (mono):** `npx @nullbuilds/x402-mcp · no signup required · works with Claude, Cursor, Windsurf`
**Tag line (above headline):** `v0.4.0 · built by null`

## Page Structure (top to bottom)

1. **Nav** — logo, Catalog, Docs, GitHub, Start free CTA
2. **Hero** — vision headline + dual CTA
3. **Traction bar** — 4 stats inline: 957 Live APIs / 13,334 Endpoints tested / Nightly (catalog updated) / 7.2% Survival rate
4. **How it works** — 3-column: Discover → Estimate → Pay
5. **Before/After** — side-by-side code blocks; left = 5-step manual x402 flow, right = single Claude prompt + success line
6. **Pricing** — single pricing box, honest "coming soon" framing
7. **Hosted wallet waitlist** — email capture, one email when it ships
8. **FAQ** — 4 questions (trimmed from 6)
9. **Footer** — npm / GitHub / Catalog / x402.org

## Section Specs

### Traction Bar
- 4 cells, bordered, equal width
- Numbers: 957, 13,334, "Nightly", "7.2%"
- Labels: Live APIs, Endpoints tested, Catalog updated, Survival rate
- Hardcode 957 and 13,334 in HTML; update manually when cron runs (cron already redeploys index.html nightly via SHA reference, so update the values each time the site is rebuilt)

### How It Works
- 3 cards, grid layout
- 01 / DISCOVER: "Browse 957 live APIs" — filter by keyword or network
- 02 / ESTIMATE: "Check the cost first" — probe live, no payment
- 03 / PAY: "One call. Payment handled." — CDP TEE, no key on device
- Step 03 gets accent color treatment (green number) to signal it's the paid tier

### Before/After
- Side-by-side code blocks
- Left: manual x402 flow (~5 steps, probe → parse → sign → encode → retry)
- Right: single Claude prompt → "✓ Paid 0.008 USDC · Response returned"
- Keep existing content, tighten copy

### Pricing Section
- Single prominent box, not a tier grid
- Left side: headline "Free forever. 0.5% when you pay." + paragraph + feature list
- Right side: "$0 to start" card with "+ 0.5% on agent payments via hosted wallet" footnote
- Feature list: Catalog access (free), Cost estimation (free), BYOW own CDP wallet (free), Hosted wallet (coming soon, dimmed)
- Copy: "No monthly fees. No seats. No tiers."

### Hosted Wallet Waitlist
- Distinct box, dark green tint background
- Headline: "Hosted wallet · coming soon"
- Sub: "No CDP setup. No key management. Just add x402-mcp and your agent can pay."
- Email input + "Notify me" button
- Footnote: "No spam. One email when hosted wallet ships."
- Backend: static for now — can wire to a form service (Formspree, Resend) later

### FAQ (4 questions)
1. Do I need a crypto wallet to use this?
2. Is my private key on my machine?
3. How is the catalog kept up to date?
4. What MCP clients does this work with?

## What Gets Removed / Moved

- Tool reference section → move to `/docs` page (create minimal docs stub)
- Scenarios cards → removed (covered by How It Works + Before/After)
- Roadmap section → removed from homepage (add to /docs or GitHub README)
- FAQ trimmed from 6 to 4 (remove "Is this open source?" and "What is x402?")

## New Pages

- `/docs` — minimal page with tool reference (7 tools, params, badges). Plain, readable.

## Files to Change

- `index.html` (full rewrite based on mockup)
- `catalog/index.html` (no changes needed)
- Add `/docs/index.html` (new, minimal)

## Cron Script Updates

- After any index.html change, update `INDEX_HTML_SHA` and `INDEX_HTML_SIZE` in `~/scripts/curate-catalog.mjs` on Mini
- SHA computed via `shasum -a 1 index.html`, size via `wc -c`

## What Stays the Same

- Color palette: `--bg: #0a0a0a`, `--accent: #00ff88`
- Typography: Inter + JetBrains Mono
- catalog.json endpoint and structure
- catalog/index.html (no changes)
- npm package, GitHub repo, all existing links
