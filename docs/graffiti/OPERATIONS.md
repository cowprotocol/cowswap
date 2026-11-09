# Graffiti Wall — Operations Guide

Audience: whoever runs this thing (ops, a teammate, or an agent). Short and
practical. Read [SPEC.md](./SPEC.md) first for what it *is*; this is how to
*run* it.

---

## 1. What runs where

```
Browser (CoW Swap page /#/graffiti)
  └─ draws a draft → signs ONE Solana burn tx → POST /v1/draw
Server (apps/graffiti-api, Fastify + SQLite)
  ├─ verifies the burn on-chain (amount, memo, freshness, no replay)
  ├─ paints pixels, bumps seq, pushes diffs over WebSocket /v1/ws
  ├─ serves the wall PNG and the built frontend (same origin)
  └─ pays for claim airdrops from a treasury keypair
Solana (devnet today, mainnet for production)
  └─ SPL token: every painted cell costs 1 unit, burned at commit
```

One process, one SQLite file, one hot wallet. That's the whole system.

## 2. Configuration (all ENV, all optional except keys)

| Variable | Default | What it does |
|---|---|---|
| `PORT` | 3199 | HTTP port |
| `MINT` | — | SPL mint address. **Defines which token the wall accepts.** Swap this = new token/canvas pairing |
| `TREASURY_KEYPAIR` | — | Path to treasury wallet JSON (pays claims, holds supply) |
| `ADMIN_TOKEN` | — | Bearer token for `/v1/admin/*`. **Set a strong one for anything public** |
| `CANVAS_WIDTH` | 4096 | Wall width in pixels |
| `CANVAS_HEIGHT` | 2048 | Wall height in pixels |
| `MAX_BOX_WIDTH` | 256 | Widest a single commit's bounding box may be |
| `MAX_BOX_HEIGHT` | 128 | Tallest a single commit's bounding box may be |
| `MAX_CELLS_PER_DRAW` | 20000 | Hard cap on cells per commit |
| `TX_MAX_AGE_SEC` | 90 | A commit tx older than this is rejected (replay window) |
| `GRAFFITI_DB` | `data/graffiti.db` | SQLite path (claims + pixels + seq) |
| `STATIC_DIR` | — | Serve a built frontend same-origin (recommended) |
| `DEV_INSECURE` | 0 | **Never in production**: skips burn verification and fakes claims |

The frontend reads geometry (`width`, `height`, `maxBox*`) from `GET /v1/info`
at load — changing canvas size is a server env change plus restart, no frontend
rebuild. Changing `MAX_BOX_*` shapes the drawing frame users position.

## 3. Day-to-day operations

### Start / stop
```bash
# start (from apps/graffiti-api, after `npm run build`)
MINT=<mint> TREASURY_KEYPAIR=.keys/treasury.json ADMIN_TOKEN=<token> \
  STATIC_DIR=../../build/cowswap PORT=3199 node dist/src/server.js
```
Logs go to stdout (JSON) — tee them to a file. `GET /v1/info` answering 200 =
healthy. A watchdog that restarts the process and alerts on failure is
strongly recommended (we run one on a 5-minute loop).

### Generate claim codes
```bash
curl -X POST <url>/v1/admin/claims -H 'authorization: Bearer <ADMIN_TOKEN>' \
  -d '{"n": 100, "amount": 5000}'
# → {"ok":true,"codes":[{"code":"…","amount":5000}, …]}
```
Claim URL to print/QR: `<url>/#/graffiti/claim?code=<code>`.
Codes are **database rows, not on-chain objects**: unlimited, generable in
advance, and they survive a token migration — the QR only contains
`domain + code`; which mint backs them is server config (`MINT`). Print QRs
before the final token exists if you like; swap `MINT` later and they pay out
the new token.

### Backups
Everything durable is one file: `data/graffiti.db`. `sqlite3 graffiti.db
".backup backup.db"` on a schedule. The treasury keypair in `.keys/` is
**money** — back it up securely and never commit it.

## 4. Security model — what an attacker can and cannot do

**Claim codes are bearer tokens.** A code is a ~130-bit random string; the
only way to redeem one is to know it. Guessing is computationally hopeless.
Each code is single-use, and redemption is atomic (the row is marked used
*before* the on-chain transfer; if the transfer fails, the code is re-armed —
so no double-pay and no lost codes). `DEV_INSECURE=1` disables all of this —
never set it in production.

**What the treasury hot wallet is, and why it must hold funds:**
when someone redeems a code the *server* pays: it creates the claimer's
token account if needed (~0.002 SOL rent) and transfers the tokens — so the
treasury needs both SOL (fees + rent) and token balance ≥ outstanding codes ×
amount. This key lives in a file on the server, i.e. a hot wallet:

- **Fund it with only the claim pool.** If you printed 100 codes × 5000,
  the treasury needs 500,000 tokens and ~0.5 SOL — put exactly that there.
  A server compromise then costs you the pool, not the token's supply.
- Keep the mint authority / remaining supply in cold storage off-server.
- Monitor the treasury: alert when SOL < ~0.1 or tokens < outstanding codes.

**Draw integrity (why nobody paints for free):** pixels only land after a
verified on-chain burn of the exact cell count, to the exact mint, from the
claiming wallet, with a fresh timestamped memo (`graffiti:v1:<pubkey>:<ts>`,
90s window), each signature usable once. No-op writes (repainting the same
color) are filtered server-side and cost nothing by design. Bounding-box and
per-commit caps stop banner floods.

**Known residual risks, honestly:** `ADMIN_TOKEN` in the clear on the wire
(HTTPS-only in production — put this behind TLS at the edge); the SQLite
DB has no auth beyond the admin endpoints being tokened; the API is
rate-limit-free today (add per-IP limits at the proxy for launch).

## 5. Migrating / launching on a new token (e.g. production)

1. Create the mint (same chain or mainnet): `scripts/create-mint.ts`.
2. Fund the treasury: claim pool of tokens + SOL for rent/fees.
3. Point the deployment at it: `MINT=<new> TREASURY_KEYPAIR=<funded>`.
4. Decide the DB: a **fresh empty DB** = fresh canvas (usual choice);
   the old canvas lives on in the old DB/backup.
5. Pre-printed QRs keep working — same domain, same codes, new token.
6. Never reuse a treasury keypair across environments.

## 6. Cleanup checklist for an upstream (cowprotocol/cowswap) PR

- [ ] Strip ops bits from the repo: `.keys/` (gitignored — verify), `api.log`,
      `data/*.db` (gitignored — verify), `docs/graffiti/OPERATIONS.md` stays.
- [ ] Search for `GRAFFITI FORK` comments — each marks a fork-specific change;
      review or revert per upstream taste.
- [ ] Token naming is centralized as strings in the page (`index.tsx`,
      `Claim.tsx`) — no fixed name is baked anywhere else; rename is a
      find/replace. Final name TBD (MOOOXELS / MOOSELS / …).
- [ ] Feature-flag the page (it currently rides on Solana-enabled flags);
      confirm the routing entry under "Learn" + the NEW badge are wanted.
- [ ] Defaults for the env table above are devnet-shaped; upstream config
      should come from their env pipeline, not the tmux command line.
- [ ] `DEV_INSECURE` mode: consider removing the code path entirely upstream.
