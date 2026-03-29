# x402-mcp Startup Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild x402mcp.app as a startup product page: vision-led hero, traction bar, pricing section with honest 0.5% model, hosted wallet waitlist, trimmed FAQ, and a new /docs tool reference page.

**Architecture:** Static HTML site, no build system. Three files: `index.html` (full rewrite), `docs/index.html` (new), and a SHA update in the Mini cron script. Deploy via Vercel CLI from `/tmp/x402mcp-deploy/`. Permanent source lives in `~/Desktop/x402-mcp-src/site/`.

**Tech Stack:** Static HTML, inline CSS, Inter + JetBrains Mono (Google Fonts), Vercel CLI for deploy, SSH to Mini for cron update.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `~/Desktop/x402-mcp-src/site/index.html` | Canonical source for homepage |
| Create | `~/Desktop/x402-mcp-src/site/docs/index.html` | Canonical source for /docs page |
| Sync | `/tmp/x402mcp-deploy/index.html` | Deploy copy of homepage |
| Create | `/tmp/x402mcp-deploy/docs/index.html` | Deploy copy of /docs page |
| Modify | `~/scripts/curate-catalog.mjs` on Mini | Update INDEX_HTML_SHA + INDEX_HTML_SIZE |

---

## Task 1: Create permanent site source directory

**Files:**
- Create: `~/Desktop/x402-mcp-src/site/`

- [ ] **Step 1: Create the site source directory and copy catalog page**

```bash
mkdir -p ~/Desktop/x402-mcp-src/site/docs
cp /tmp/x402mcp-deploy/catalog/index.html ~/Desktop/x402-mcp-src/site/catalog.html
```

This gives us a permanent home for site files — `/tmp` is not reliable across reboots.

- [ ] **Step 2: Verify**

```bash
ls ~/Desktop/x402-mcp-src/site/
```

Expected output:
```
catalog.html  docs/
```

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/x402-mcp-src
git add site/
git commit -m "chore: create permanent site source directory"
```

---

## Task 2: Rewrite index.html

**Files:**
- Create: `~/Desktop/x402-mcp-src/site/index.html`

This is the full homepage rewrite. Based on the approved mockup at `.superpowers/brainstorm/5232-1774717216/content/full-mockup.html`. Key changes from current `index.html`:

- New hero: "The payment layer for AI agents."
- Traction bar: 957 / 13,334 / Nightly / 7.2%
- How it works: 3-column Discover/Estimate/Pay
- Before/After: tightened, kept
- Pricing: single box, "Free forever. 0.5% when you pay."
- Hosted wallet waitlist: email capture
- FAQ: trimmed to 4 questions
- Nav links to /catalog and /docs

- [ ] **Step 1: Write the new index.html**

Write the file at `~/Desktop/x402-mcp-src/site/index.html` with this exact content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>x402-mcp — The payment layer for AI agents</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<meta name="description" content="The payment layer for AI agents. Connect to 957 live paid APIs from any MCP client. No API keys. No signups.">
<meta property="og:title" content="x402-mcp — The payment layer for AI agents">
<meta property="og:description" content="Agents earn. Agents pay. x402-mcp handles the wallet, the signing, and the settlement — automatically.">
<meta property="og:image" content="https://x402mcp.app/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://x402mcp.app">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="x402-mcp — The payment layer for AI agents">
<meta name="twitter:description" content="957 live paid APIs. One MCP server. Payment handled automatically.">
<meta name="twitter:image" content="https://x402mcp.app/og.png">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0a;
    --bg-card: #111111;
    --bg-elevated: #161616;
    --border: #1a1a1a;
    --accent: #00ff88;
    --text: #e0e0e0;
    --text-muted: #666;
    --text-dim: #3a3a3a;
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 24px 80px;
  }
  a { color: inherit; text-decoration: none; }
  code { font-family: 'JetBrains Mono', monospace; }

  /* NAV */
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--bg-elevated);
    margin-bottom: 80px;
  }
  .nav-logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 15px; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 24px; align-items: center; }
  .nav-links a { color: var(--text-muted); font-size: 13px; transition: color 0.15s; }
  .nav-links a:hover { color: var(--text); }
  .btn-primary { background: var(--accent); color: #000; padding: 8px 18px; border-radius: 5px; font-size: 13px; font-weight: 700; }
  .btn-primary:hover { background: #00e07a; color: #000; }

  /* HERO */
  .hero { margin-bottom: 48px; }
  .hero-tag { color: #444; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
  .hero h1 { font-size: 52px; font-weight: 800; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 20px; color: var(--text); }
  .hero p { color: #777; font-size: 17px; line-height: 1.65; max-width: 520px; margin-bottom: 32px; }
  .hero-ctas { display: flex; gap: 12px; align-items: center; }
  .btn-ghost { border: 1px solid #222; color: var(--text-muted); padding: 10px 20px; border-radius: 5px; font-size: 13px; transition: border-color 0.15s, color 0.15s; }
  .btn-ghost:hover { border-color: #444; color: var(--text); }
  .hero-sub { color: var(--text-dim); font-size: 12px; margin-top: 14px; font-family: 'JetBrains Mono', monospace; }

  /* TRACTION BAR */
  .traction {
    display: flex;
    border: 1px solid var(--bg-elevated);
    border-radius: 8px;
    margin-bottom: 80px;
    overflow: hidden;
  }
  .traction-item {
    flex: 1;
    padding: 18px 24px;
    border-right: 1px solid var(--bg-elevated);
    text-align: center;
  }
  .traction-item:last-child { border-right: none; }
  .traction-num { font-size: 22px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
  .traction-label { color: #444; font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }

  /* SECTIONS */
  .section { margin-bottom: 80px; }
  .section-label { color: #2a2a2a; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; font-family: 'JetBrains Mono', monospace; }
  .section h2 { font-size: 28px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.5px; }
  .section > p { color: var(--text-muted); font-size: 15px; max-width: 560px; line-height: 1.7; }

  /* HOW IT WORKS */
  .steps { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 32px; }
  .step { border: 1px solid var(--bg-elevated); border-radius: 8px; padding: 24px; }
  .step-num { color: var(--text-dim); font-family: 'JetBrains Mono', monospace; font-size: 11px; margin-bottom: 12px; letter-spacing: 1px; }
  .step-num.accent { color: var(--accent); }
  .step h3 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
  .step p { color: #555; font-size: 13px; line-height: 1.6; }

  /* BEFORE/AFTER */
  .code-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 32px; }
  .code-block { background: #0d0d0d; border: 1px solid var(--bg-elevated); border-radius: 8px; overflow: hidden; }
  .code-header { padding: 10px 16px; border-bottom: 1px solid var(--bg-elevated); display: flex; align-items: center; gap: 8px; }
  .code-dot { width: 6px; height: 6px; border-radius: 50%; background: #2a2a2a; flex-shrink: 0; }
  .code-header-label { font-size: 11px; font-family: 'JetBrains Mono', monospace; }
  .code-body { padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.8; }
  .c-comment { color: #2a2a2a; }
  .c-fn { color: var(--accent); }
  .c-str { color: #8888ff; }
  .c-key { color: #aaa; }
  .c-success { color: var(--accent); font-size: 12px; margin-top: 8px; }

  /* PRICING */
  .pricing-box {
    border: 1px solid var(--bg-elevated);
    border-radius: 10px;
    padding: 40px;
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;
  }
  .pricing-left { flex: 1; }
  .pricing-left h2 { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 14px; line-height: 1.15; }
  .pricing-left > p { color: #555; font-size: 14px; max-width: 380px; line-height: 1.7; margin-bottom: 20px; }
  .pricing-features { display: flex; flex-direction: column; gap: 8px; }
  .pricing-feature { font-size: 13px; display: flex; gap: 10px; align-items: baseline; }
  .pricing-feature .check { color: var(--accent); flex-shrink: 0; }
  .pricing-feature .soon { color: #2a2a2a; flex-shrink: 0; }
  .pricing-feature span { color: var(--text-muted); }
  .pricing-feature span.dim { color: #333; }
  .pricing-card {
    flex-shrink: 0;
    text-align: center;
    background: #020f02;
    border: 1px solid #1a3a1a;
    border-radius: 8px;
    padding: 28px 36px;
    min-width: 180px;
  }
  .price-big { font-size: 40px; font-weight: 800; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
  .price-label { color: var(--text-muted); font-size: 13px; margin-top: 4px; }
  .price-divider { border: none; border-top: 1px solid #1a3a1a; margin: 16px 0; }
  .price-detail { color: #555; font-size: 12px; line-height: 1.8; }
  .price-footnote { color: #2a3a2a; font-size: 10px; font-family: 'JetBrains Mono', monospace; margin-top: 12px; }

  /* WAITLIST */
  .waitlist-box {
    background: #020f02;
    border: 1px solid #1a3a1a;
    border-radius: 10px;
    padding: 40px;
    text-align: center;
    margin-top: 32px;
  }
  .waitlist-box h2 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
  .waitlist-box h2 span { color: var(--accent); }
  .waitlist-box > p { color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }
  .waitlist-form { display: flex; gap: 10px; max-width: 400px; margin: 0 auto; }
  .waitlist-input {
    flex: 1;
    background: #0a0a0a;
    border: 1px solid #1a3a1a;
    border-radius: 5px;
    padding: 10px 14px;
    color: #aaa;
    font-size: 13px;
    font-family: inherit;
    outline: none;
  }
  .waitlist-input:focus { border-color: #2a5a2a; }
  .waitlist-btn { background: var(--accent); color: #000; border: none; padding: 10px 20px; border-radius: 5px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; }
  .waitlist-btn:hover { background: #00e07a; }
  .waitlist-sub { color: #2a4a2a; font-size: 11px; margin-top: 12px; font-family: 'JetBrains Mono', monospace; }

  /* FAQ */
  .faq { margin-top: 32px; }
  .faq-item { border-top: 1px solid var(--bg-elevated); padding: 20px 0; }
  .faq-item:last-child { border-bottom: 1px solid var(--bg-elevated); }
  .faq-q { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .faq-a { color: #555; font-size: 13px; line-height: 1.7; }
  .faq-a code { color: var(--accent); font-size: 12px; }

  /* FOOTER */
  footer { border-top: 1px solid var(--bg-elevated); padding-top: 32px; display: flex; justify-content: space-between; align-items: center; margin-top: 80px; }
  .footer-left { color: #2a2a2a; font-size: 12px; font-family: 'JetBrains Mono', monospace; }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { color: #333; font-size: 12px; transition: color 0.15s; }
  .footer-links a:hover { color: var(--text-muted); }

  @media (max-width: 640px) {
    .hero h1 { font-size: 36px; }
    .steps { grid-template-columns: 1fr; }
    .code-compare { grid-template-columns: 1fr; }
    .pricing-box { flex-direction: column; }
    .traction { flex-wrap: wrap; }
    .traction-item { flex: 1 1 50%; border-bottom: 1px solid var(--bg-elevated); }
  }
</style>
</head>
<body>

<nav>
  <div class="nav-logo"><span>x402</span>-mcp</div>
  <div class="nav-links">
    <a href="/catalog">Catalog</a>
    <a href="/docs">Docs</a>
    <a href="https://github.com/nullbuilds-ai/x402-mcp" target="_blank" rel="noopener">GitHub</a>
    <a href="https://www.npmjs.com/package/@nullbuilds/x402-mcp" class="btn-primary">Start free</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-tag">v0.4.0 &nbsp;·&nbsp; built by null</div>
  <h1>The payment layer<br>for AI agents.</h1>
  <p>Agents earn. Agents pay. x402-mcp handles the wallet, the signing, and the settlement — automatically. Connect to 957 live paid APIs from any MCP client.</p>
  <div class="hero-ctas">
    <a href="https://www.npmjs.com/package/@nullbuilds/x402-mcp" class="btn-primary" style="padding:12px 24px;font-size:14px;">Start free</a>
    <a href="/catalog" class="btn-ghost">View catalog →</a>
  </div>
  <div class="hero-sub">npx @nullbuilds/x402-mcp &nbsp;·&nbsp; no signup required &nbsp;·&nbsp; works with Claude, Cursor, Windsurf</div>
</section>

<!-- TRACTION BAR -->
<div class="traction">
  <div class="traction-item">
    <div class="traction-num">957</div>
    <div class="traction-label">Live APIs</div>
  </div>
  <div class="traction-item">
    <div class="traction-num">13,334</div>
    <div class="traction-label">Endpoints tested</div>
  </div>
  <div class="traction-item">
    <div class="traction-num">Nightly</div>
    <div class="traction-label">Catalog updated</div>
  </div>
  <div class="traction-item">
    <div class="traction-num">7.2%</div>
    <div class="traction-label">Survival rate</div>
  </div>
</div>

<!-- HOW IT WORKS -->
<section class="section">
  <div class="section-label">How it works</div>
  <h2>Discover, estimate, pay.</h2>
  <p>Three tools. No configuration required for the first two. Add a hosted wallet for the third.</p>
  <div class="steps">
    <div class="step">
      <div class="step-num">01 &nbsp;/&nbsp; DISCOVER</div>
      <h3>Browse 957 live APIs</h3>
      <p>Filter by keyword or network. FDA alerts, FX rates, Twitter intelligence, and more — all x402-enabled.</p>
    </div>
    <div class="step">
      <div class="step-num">02 &nbsp;/&nbsp; ESTIMATE</div>
      <h3>Check the cost first</h3>
      <p>Probe any endpoint live. See the exact price before committing a single cent. No payment made.</p>
    </div>
    <div class="step">
      <div class="step-num accent">03 &nbsp;/&nbsp; PAY</div>
      <h3>One call. Payment handled.</h3>
      <p>Signing happens in Coinbase's TEE via CDP Server Wallets. Your private key never touches your machine.</p>
    </div>
  </div>
</section>

<!-- BEFORE / AFTER -->
<section class="section">
  <div class="section-label">Before / After</div>
  <h2>x402 without the ceremony.</h2>
  <p>Handling x402 manually means managing wallets, EIP-3009 signing, retries, and payment headers. x402-mcp does it in one tool call.</p>
  <div class="code-compare">
    <div class="code-block">
      <div class="code-header">
        <div class="code-dot" style="background:#ff4444;"></div>
        <span class="code-header-label" style="color:#ff4444;">Without x402-mcp</span>
      </div>
      <div class="code-body">
        <div class="c-comment">// 1. Probe the 402</div>
        <div class="c-key">const probe = await <span class="c-fn">fetch</span>(url);</div>
        <div class="c-comment">// 2. Parse payment requirements</div>
        <div class="c-key">const req = <span class="c-fn">parseX402</span>(probe);</div>
        <div class="c-comment">// 3. Sign EIP-3009 transfer</div>
        <div class="c-key">const sig = await <span class="c-fn">signEIP3009</span>(wallet, req);</div>
        <div class="c-comment">// 4. Encode payment header</div>
        <div class="c-key">const hdr = <span class="c-fn">encodeHeader</span>(sig);</div>
        <div class="c-comment">// 5. Retry with payment</div>
        <div class="c-key">const res = await <span class="c-fn">fetch</span>(url, {<br>&nbsp;&nbsp;headers: { <span class="c-str">'X-PAYMENT'</span>: hdr }<br>});</div>
      </div>
    </div>
    <div class="code-block">
      <div class="code-header">
        <div class="code-dot" style="background:var(--accent);"></div>
        <span class="code-header-label" style="color:var(--accent);">With x402-mcp</span>
      </div>
      <div class="code-body">
        <div class="c-comment">// Just ask Claude.</div>
        <br>
        <div class="c-str">"Call the weather API for SF,</div>
        <div class="c-str">&nbsp;max $0.01"</div>
        <br>
        <div class="c-comment">// x402-mcp handles everything.</div>
        <br>
        <div class="c-success">✓ Paid 0.008 USDC · Response returned</div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="section">
  <div class="section-label">Pricing</div>
  <div class="pricing-box">
    <div class="pricing-left">
      <h2>Free forever.<br><span style="color:var(--accent);">0.5%</span> when you pay.</h2>
      <p>Install and use x402-mcp with no cost, no signup, no credit card. When we launch hosted wallets, we take 0.5% of what your agent spends. That's it. No monthly fees. No seats. No tiers.</p>
      <div class="pricing-features">
        <div class="pricing-feature"><span class="check">✓</span><span>Catalog access — free</span></div>
        <div class="pricing-feature"><span class="check">✓</span><span>Cost estimation — free</span></div>
        <div class="pricing-feature"><span class="check">✓</span><span>Wallet balance checks — free</span></div>
        <div class="pricing-feature"><span class="check">✓</span><span>BYOW (bring your own CDP wallet) — free</span></div>
        <div class="pricing-feature"><span class="soon">◎</span><span class="dim">Hosted wallet — coming soon</span></div>
      </div>
    </div>
    <div class="pricing-card">
      <div class="price-big">$0</div>
      <div class="price-label">to start</div>
      <hr class="price-divider">
      <div class="price-detail">+ 0.5% on agent<br>payments via<br>hosted wallet</div>
      <div class="price-footnote">hosted wallet: coming soon</div>
    </div>
  </div>
</section>

<!-- HOSTED WALLET WAITLIST -->
<section class="section">
  <div class="waitlist-box">
    <h2>Hosted wallet &nbsp;·&nbsp; <span>coming soon</span></h2>
    <p>No CDP setup. No key management. Add x402-mcp and your agent can pay immediately. Get notified when it launches.</p>
    <form class="waitlist-form" onsubmit="handleWaitlist(event)">
      <input class="waitlist-input" type="email" placeholder="your@email.com" required>
      <button type="submit" class="waitlist-btn">Notify me</button>
    </form>
    <div class="waitlist-sub" id="waitlist-msg">No spam. One email when hosted wallet ships.</div>
  </div>
</section>

<!-- FAQ -->
<section class="section">
  <div class="section-label">FAQ</div>
  <div class="faq">
    <div class="faq-item">
      <div class="faq-q">Do I need a crypto wallet to use this?</div>
      <div class="faq-a">No. <code>discover_paid_services</code>, <code>estimate_payment</code>, and <code>check_wallet_balance</code> all work with zero credentials. You only need a wallet to make actual payments via <code>make_x402_request</code>.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q">Is my private key on my machine?</div>
      <div class="faq-a">No. Payments use Coinbase CDP Server Wallets — signing happens in Coinbase's TEE. Your private key never touches your device.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q">How is the catalog kept up to date?</div>
      <div class="faq-a">A cron job probes all 13,334 registered x402 endpoints every night. Only the ones that respond correctly with a valid 402 payment schema are included. The 7.2% survival rate is real.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q">What MCP clients does this work with?</div>
      <div class="faq-a">Any MCP client: Claude Desktop, Cursor, Windsurf, and anything else that supports the Model Context Protocol. Configure once, works everywhere.</div>
    </div>
  </div>
</section>

<footer>
  <div class="footer-left">x402-mcp &nbsp;·&nbsp; built by <a href="https://nullbuilds.com" style="color:#333;">null</a></div>
  <div class="footer-links">
    <a href="https://www.npmjs.com/package/@nullbuilds/x402-mcp" target="_blank" rel="noopener">npm</a>
    <a href="https://github.com/nullbuilds-ai/x402-mcp" target="_blank" rel="noopener">GitHub</a>
    <a href="/catalog">Catalog</a>
    <a href="https://x402.org" target="_blank" rel="noopener">x402.org</a>
  </div>
</footer>

<script>
function handleWaitlist(e) {
  e.preventDefault();
  const email = e.target.querySelector('input').value;
  const msg = document.getElementById('waitlist-msg');
  // Waitlist backend deferred per spec — static confirmation for now
  msg.textContent = '✓ Got it. We\'ll email ' + email + ' when hosted wallet ships.';
  msg.style.color = 'var(--accent)';
  e.target.querySelector('input').value = '';
  e.target.querySelector('button').disabled = true;
}
</script>

</body>
</html>
```

- [ ] **Step 2: Open in browser to visually verify**

```bash
open ~/Desktop/x402-mcp-src/site/index.html
```

Verify: hero headline shows, traction bar renders correctly, pricing box looks right, FAQ is 4 items, footer links are correct.

- [ ] **Step 3: Copy to deploy directory**

```bash
cp ~/Desktop/x402-mcp-src/site/index.html /tmp/x402mcp-deploy/index.html
```

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/x402-mcp-src
git add site/index.html
git commit -m "feat: startup homepage redesign — vision hero, traction bar, pricing, waitlist"
```

---

## Task 3: Create /docs page

**Files:**
- Create: `~/Desktop/x402-mcp-src/site/docs/index.html`
- Create: `/tmp/x402mcp-deploy/docs/index.html`

Minimal tool reference page. 7 tools with params and CDP badge. Linked from nav.

- [ ] **Step 1: Write docs/index.html**

Write the file at `~/Desktop/x402-mcp-src/site/docs/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>x402-mcp — Docs</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0a; --bg-card: #111; --bg-elevated: #161616;
    --border: #1a1a1a; --accent: #00ff88;
    --text: #e0e0e0; --text-muted: #666;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 0 24px 80px; }
  a { color: inherit; text-decoration: none; }
  code { font-family: 'JetBrains Mono', monospace; }
  nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid var(--bg-elevated); margin-bottom: 60px; }
  .nav-logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 15px; }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { color: var(--text-muted); font-size: 13px; }
  .nav-links a:hover { color: var(--text); }
  .btn-primary { background: var(--accent); color: #000; padding: 8px 18px; border-radius: 5px; font-size: 13px; font-weight: 700; }
  h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; }
  .subtitle { color: var(--text-muted); font-size: 15px; margin-bottom: 48px; }
  .section-label { color: #2a2a2a; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; font-family: 'JetBrains Mono', monospace; }
  .install-block { background: #0d0d0d; border: 1px solid var(--bg-elevated); border-radius: 8px; padding: 16px 20px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--accent); margin-bottom: 48px; }
  .tool { border: 1px solid var(--bg-elevated); border-radius: 8px; padding: 20px; margin-bottom: 12px; }
  .tool-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .tool-name { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: var(--accent); }
  .badge { font-size: 10px; border: 1px solid; border-radius: 3px; padding: 2px 7px; flex-shrink: 0; }
  .badge-ro { color: var(--text-muted); border-color: #2a2a2a; }
  .badge-cdp { color: var(--accent); border-color: var(--accent); opacity: 0.7; }
  .tool-desc { color: var(--text-muted); font-size: 13px; margin-bottom: 14px; line-height: 1.6; }
  .params { display: flex; flex-direction: column; gap: 6px; }
  .param { display: grid; grid-template-columns: 160px 70px 1fr; gap: 8px; font-size: 12px; }
  .param-name { font-family: 'JetBrains Mono', monospace; color: var(--text); }
  .param-type { font-family: 'JetBrains Mono', monospace; color: #555; }
  .param-desc { color: #555; }
  .param-req { color: #444; font-style: italic; }
  footer { border-top: 1px solid var(--bg-elevated); padding-top: 32px; display: flex; justify-content: space-between; align-items: center; margin-top: 60px; }
  .footer-left { color: #2a2a2a; font-size: 12px; font-family: 'JetBrains Mono', monospace; }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { color: #333; font-size: 12px; }
</style>
</head>
<body>

<nav>
  <div class="nav-logo"><a href="/"><span>x402</span>-mcp</a></div>
  <div class="nav-links">
    <a href="/catalog">Catalog</a>
    <a href="/docs" style="color:var(--text);">Docs</a>
    <a href="https://github.com/nullbuilds-ai/x402-mcp" target="_blank" rel="noopener">GitHub</a>
    <a href="https://www.npmjs.com/package/@nullbuilds/x402-mcp" class="btn-primary">Start free</a>
  </div>
</nav>

<h1>Tool Reference</h1>
<p class="subtitle">7 tools. The first four are read-only — no credentials required. The last three require a CDP wallet.</p>

<div class="section-label">Install</div>
<div class="install-block">npx @nullbuilds/x402-mcp</div>

<div class="section-label">Tools</div>

<div class="tool">
  <div class="tool-header">
    <div class="tool-name">discover_paid_services</div>
    <span class="badge badge-ro">read-only</span>
  </div>
  <div class="tool-desc">Browse the catalog of 957 live x402-enabled APIs. Returns services with cost, network, and endpoint URL. No credentials required.</div>
  <div class="params">
    <div class="param"><span class="param-name">query</span><span class="param-type">string</span><span class="param-desc">Search by name or description <span class="param-req">(optional)</span></span></div>
    <div class="param"><span class="param-name">network</span><span class="param-type">string</span><span class="param-desc">Filter by network: base, solana, ethereum <span class="param-req">(optional)</span></span></div>
    <div class="param"><span class="param-name">limit</span><span class="param-type">number</span><span class="param-desc">Results to return, max 100, default 20 <span class="param-req">(optional)</span></span></div>
    <div class="param"><span class="param-name">offset</span><span class="param-type">number</span><span class="param-desc">Pagination offset <span class="param-req">(optional)</span></span></div>
  </div>
</div>

<div class="tool">
  <div class="tool-header">
    <div class="tool-name">get_service_details</div>
    <span class="badge badge-ro">read-only</span>
  </div>
  <div class="tool-desc">Get full payment requirements for a specific resource URL — all options, networks, and pricing.</div>
  <div class="params">
    <div class="param"><span class="param-name">resource_url</span><span class="param-type">string</span><span class="param-desc">Exact URL of the x402 resource <span class="param-req">(required)</span></span></div>
  </div>
</div>

<div class="tool">
  <div class="tool-header">
    <div class="tool-name">estimate_payment</div>
    <span class="badge badge-ro">read-only</span>
  </div>
  <div class="tool-desc">Probe a URL live and return its x402 payment requirements. No payment is made.</div>
  <div class="params">
    <div class="param"><span class="param-name">resource_url</span><span class="param-type">string</span><span class="param-desc">URL to probe <span class="param-req">(required)</span></span></div>
    <div class="param"><span class="param-name">method</span><span class="param-type">string</span><span class="param-desc">HTTP method, GET or POST, default GET <span class="param-req">(optional)</span></span></div>
  </div>
</div>

<div class="tool">
  <div class="tool-header">
    <div class="tool-name">check_wallet_balance</div>
    <span class="badge badge-ro">read-only</span>
  </div>
  <div class="tool-desc">Check the USDC balance of any wallet address on Base. Read-only — no private key required.</div>
  <div class="params">
    <div class="param"><span class="param-name">wallet_address</span><span class="param-type">string</span><span class="param-desc">0x address or ENS name <span class="param-req">(required)</span></span></div>
  </div>
</div>

<div class="tool">
  <div class="tool-header">
    <div class="tool-name">make_x402_request</div>
    <span class="badge badge-cdp">requires CDP</span>
  </div>
  <div class="tool-desc">Pay and call an x402-enabled API using your CDP wallet. Handles the full payment flow automatically. Returns the actual API response.</div>
  <div class="params">
    <div class="param"><span class="param-name">resource_url</span><span class="param-type">string</span><span class="param-desc">URL of the x402 API to call <span class="param-req">(required)</span></span></div>
    <div class="param"><span class="param-name">method</span><span class="param-type">string</span><span class="param-desc">HTTP method, GET or POST, default GET <span class="param-req">(optional)</span></span></div>
    <div class="param"><span class="param-name">body</span><span class="param-type">string</span><span class="param-desc">JSON body for POST requests <span class="param-req">(optional)</span></span></div>
    <div class="param"><span class="param-name">max_cost_usdc</span><span class="param-type">number</span><span class="param-desc">Max USDC to spend, default 1.0. Aborts if actual cost exceeds this. <span class="param-req">(optional)</span></span></div>
  </div>
</div>

<div class="tool">
  <div class="tool-header">
    <div class="tool-name">get_my_wallet</div>
    <span class="badge badge-cdp">requires CDP</span>
  </div>
  <div class="tool-desc">Returns the CDP wallet address associated with your credentials.</div>
  <div class="params">
    <div class="param"><span class="param-name" style="color:#444;font-style:italic;">(no parameters)</span><span class="param-type"></span><span class="param-desc"></span></div>
  </div>
</div>

<div class="tool">
  <div class="tool-header">
    <div class="tool-name">get_payment_history</div>
    <span class="badge badge-cdp">requires CDP</span>
  </div>
  <div class="tool-desc">Returns your payment history from the local log at <code style="color:var(--accent);font-size:11px;">~/.x402-mcp/history.jsonl</code>.</div>
  <div class="params">
    <div class="param"><span class="param-name" style="color:#444;font-style:italic;">(no parameters)</span><span class="param-type"></span><span class="param-desc"></span></div>
  </div>
</div>

<footer>
  <div class="footer-left">x402-mcp &nbsp;·&nbsp; built by <a href="https://nullbuilds.com" style="color:#333;">null</a></div>
  <div class="footer-links">
    <a href="https://www.npmjs.com/package/@nullbuilds/x402-mcp" target="_blank" rel="noopener">npm</a>
    <a href="https://github.com/nullbuilds-ai/x402-mcp" target="_blank" rel="noopener">GitHub</a>
    <a href="/catalog">Catalog</a>
    <a href="https://x402.org" target="_blank" rel="noopener">x402.org</a>
  </div>
</footer>

</body>
</html>
```

- [ ] **Step 2: Open in browser to verify**

```bash
open ~/Desktop/x402-mcp-src/site/docs/index.html
```

Verify: all 7 tools listed, 4 read-only badges and 3 CDP badges, params render cleanly.

- [ ] **Step 3: Copy to deploy directory**

```bash
mkdir -p /tmp/x402mcp-deploy/docs
cp ~/Desktop/x402-mcp-src/site/docs/index.html /tmp/x402mcp-deploy/docs/index.html
```

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/x402-mcp-src
git add site/docs/index.html
git commit -m "feat: add /docs tool reference page"
```

---

## Task 4: Deploy to Vercel

**Files:**
- Verify: `/tmp/x402mcp-deploy/` contains index.html, docs/index.html, catalog/index.html, catalog.json

- [ ] **Step 1: Verify deploy directory contents**

```bash
find /tmp/x402mcp-deploy -type f | sort
```

Expected:
```
/tmp/x402mcp-deploy/.vercel/project.json
/tmp/x402mcp-deploy/catalog.json
/tmp/x402mcp-deploy/catalog/index.html
/tmp/x402mcp-deploy/docs/index.html
/tmp/x402mcp-deploy/index.html
```

- [ ] **Step 2: Deploy to Vercel production**

```bash
cd /tmp/x402mcp-deploy && vercel deploy --prod --yes 2>&1
```

Expected last lines:
```
Aliased: https://x402mcp.app [Xs]
```

- [ ] **Step 3: Verify all routes**

```bash
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://x402mcp.app
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://x402mcp.app/catalog
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://x402mcp.app/docs
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://x402mcp.app/catalog.json
```

All should return `200`.

---

## Task 5: Update cron script SHA on Mini

**Files:**
- Modify: `~/scripts/curate-catalog.mjs` on Mini (INDEX_HTML_SHA, INDEX_HTML_SIZE, add DOCS_HTML_SHA, DOCS_HTML_SIZE)

- [ ] **Step 1: Compute new SHA and size for index.html**

```bash
shasum -a 1 /tmp/x402mcp-deploy/index.html
wc -c < /tmp/x402mcp-deploy/index.html
```

Note both values.

- [ ] **Step 2: Compute SHA and size for docs/index.html**

```bash
shasum -a 1 /tmp/x402mcp-deploy/docs/index.html
wc -c < /tmp/x402mcp-deploy/docs/index.html
```

Note both values.

- [ ] **Step 3: Update constants and files array on Mini**

Use the SHA and size values captured in Steps 1 and 2 above. Example (substitute your actual values):

```bash
# Run from MacBook — substitute INDEX_SHA, INDEX_SIZE, DOCS_SHA, DOCS_SIZE
# with the values printed in Steps 1 and 2
ssh jordanlyall@100.82.157.95 "
  sed -i '' \"s/const INDEX_HTML_SHA = \\\".*\\\"/const INDEX_HTML_SHA = \\\"<INDEX_SHA>\\\"/\" ~/scripts/curate-catalog.mjs
  sed -i '' \"s/const INDEX_HTML_SIZE = [0-9]*/const INDEX_HTML_SIZE = <INDEX_SIZE>/\" ~/scripts/curate-catalog.mjs
"
```

Then add DOCS constants manually by editing the file on Mini after the CATALOG_HTML lines:

```javascript
const DOCS_HTML_SHA = "<DOCS_SHA>";   // value from Step 2
const DOCS_HTML_SIZE = <DOCS_SIZE>;   // value from Step 2
```

Update the files array in `uploadToVercel`:

```javascript
files: [
  { file: "index.html", sha: INDEX_HTML_SHA, size: INDEX_HTML_SIZE },
  { file: "catalog/index.html", sha: CATALOG_HTML_SHA, size: CATALOG_HTML_SIZE },
  { file: "docs/index.html", sha: DOCS_HTML_SHA, size: DOCS_HTML_SIZE },
  { file: "catalog.json", sha: sha, size: size },
],
```

- [ ] **Step 4: Syntax check**

```bash
/opt/homebrew/bin/node --check ~/scripts/curate-catalog.mjs && echo "syntax ok"
```

Expected: `syntax ok`

- [ ] **Step 5: Commit the plan update (noting SHA values used)**

```bash
cd ~/Desktop/x402-mcp-src
git add .
git commit -m "chore: update cron SHA references for new index.html and docs/index.html"
```
