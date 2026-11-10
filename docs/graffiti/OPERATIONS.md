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
| `CANVAS_WIDTH` | 3840 | Wall width in pixels. Sized against the ink in circulation, see below |
| `CANVAS_HEIGHT` | 2160 | Wall height in pixels |
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

**Sizing the canvas.** One token paints one cell, so the wall should be sized
against the ink in circulation, not picked for its own sake. Aim for a full
spend of every outstanding code to land near 50-60% coverage: a wall that
saturates gets repainted over itself and the early painters lose their work,
while one far too large reads as faint noise behind the app.

    cells ~= (codes x amount) / 0.55

1000 codes x 5000 tokens is 5M cells of paint, hence the 3840x2160 default
(8.29M cells). Realistic turnout — not every card is redeemed, and few painters
spend their whole balance — lands nearer 20%. Keep it 16:9 so `cover` crops
nothing on a widescreen desktop; a phone in portrait sees the central ~26% of
the width whatever the ratio, so treat the middle as the hero area.

**Do not change it after launch.** Cells are stored as absolute coordinates, so
a resize re-interprets every pixel already painted.

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

Against a running server:
```bash
curl -sS -X POST https://<host>/v1/admin/claims \
  -H 'authorization: Bearer <ADMIN_TOKEN>' \
  -H 'content-type: application/json' \
  -d '{"n": 1000, "amount": 5000}' > codes.json
```
`n` is capped at 1000 per call; repeat for more. The `content-type` header is
required.

Offline, straight into the SQLite file the server reads:
```bash
cd apps/graffiti-api
GRAFFITI_DB=data/graffiti.db pnpm claims:gen -- --n 1000 --amount 5000 --out data/codes.txt
```
Use `--out`, not `>`: npm and pnpm print their script banner to stdout and it
lands in the file. `claims:pdf` rejects such a file rather than printing dead QRs.

**Fund the treasury before printing.** 1000 codes x 5000 tokens is a 5,000,000
token pool, plus ~2.1 SOL for the claimers' account rent. Mint the pool and a
reserve (`INITIAL_SUPPLY`), then move the reserve off the treasury: what sits in
the hot wallet should be the outstanding liability and no more.

Codes are database rows, not on-chain objects, and survive a token migration: the
QR holds only domain + code, and `MINT` decides which token pays out.

### Print claim cards

`scripts/make-claim-pdf.ts` renders a code list as a print-ready PDF: 12 cards
per A4 page, each the artwork at full bleed, crop marks in the margin.

```bash
cd apps/graffiti-api

# proof one page, then the full run
pnpm claims:pdf -- --codes data/codes.txt --base-url https://swap.cow.fi \
  --limit 12 --out data/proof.pdf
pnpm claims:pdf -- --codes data/codes.txt --base-url https://swap.cow.fi \
  --out data/claim-cards.pdf
```

Cut a card out of the proof and scan it with a phone before running 84 pages.

`--codes` takes the one-per-line list or the admin JSON. Paths resolve against
`apps/graffiti-api/`, and `data/` is gitignored — keep both files there.
`--help` lists every flag.

**Scannability.** Every run reports the printed module size, e.g.
`QR 16.6mm at 37 modules (ecc M) -> 0.41mm per module`. That number, not print
resolution, decides whether a phone reads the card, and it warns below 0.40 mm.
To raise it: shorten `--base-url` (the 63-character claim URL costs a whole QR
version), `--ecc L`, or fewer cards per page.

**Testing locally.** `--base-url http://localhost:3199` aims the QRs at a local
server; `APP_BASE_URL` sets the default. `localhost` only resolves on that
machine, so to scan from a phone use its LAN address instead
(`http://192.168.1.20:3000`), and make sure those codes exist in the DB it reads.

**Artwork.** `assets/cows-in-love.png` reserves two zones: the splash panel takes
the text, the framed square takes the QR, and their placeholder marks are painted
over. Coordinates are card fractions in `ART_TEXT_BOX` / `ART_QR_BOX`, or
`--text-box` / `--qr-box` for other artwork. PNG or JPEG only, >= 1200 px; cards
inherit the image's aspect ratio. `--image none` proofs the layout without it.

**Type.** Permanent Marker (headline) and Barlow Condensed (body) ship in
`assets/fonts/`; `--font-display` / `--font-body` take other TTFs. The three
sizes are fitted to the panel together, so new text reflows instead of
overflowing.

**Printing.** Actual size, not "fit to page", on 200-250 g/m². 1000 cards is
~4 MB: one embedded image, vector QRs. Cards tile edge to edge, so a slightly
off cut shows the neighbour rather than a white sliver.

**Treat the PDF like cash** — every card is a bearer token for `amount` tokens.
Don't mail it around, and reprint from fresh codes if a batch leaks.

### Backups
Everything durable is one file: `data/graffiti.db`. `sqlite3 graffiti.db
".backup backup.db"` on a schedule. The treasury keypair in `.keys/` is
**money** — back it up securely and never commit it.

## 4. Security model — what an attacker can and cannot do

**Claim codes are bearer tokens.** A code is 22 base58 characters (~129 bits)
drawn from the OS CSPRNG with rejection sampling, so the alphabet is unbiased
and codes are not predictable from ones already redeemed. The only way to
redeem one is to know it; guessing is computationally hopeless, and
`/v1/claim` is rate-limited per IP on top of that.

Redemption uses a state machine rather than a boolean, because "the transfer
failed" and "we don't know whether the transfer landed" are different:

| State     | Meaning                                                              |
| --------- | -------------------------------------------------------------------- |
| `unused`  | Claimable.                                                            |
| `pending` | Reserved atomically while the transfer is in flight.                   |
| `used`    | Transfer confirmed. Terminal.                                          |
| `failed`  | Submitted but never confirmed — it may still have landed. Terminal.    |

A code is only returned to `unused` when nothing was submitted, or when the
transaction landed and definitively failed. A submitted-but-unconfirmed
transfer parks the code in `failed` and it is **never** auto-released: doing
so is how a treasury pays twice for one code. Those codes surface at
`GET /v1/admin/claims/failed` and need an operator to check the signature
on-chain before deciding.

The ATA creation and the transfer go out in a single transaction, so a claim
cannot leave an account created but unfunded.

`DEV_INSECURE=1` disables on-chain verification entirely; the server refuses
to start with it set on a mainnet `NETWORK` or with `NODE_ENV=production`.

**What the treasury hot wallet is, and why it must hold funds:**
when someone redeems a code the *server* pays: it creates the claimer's
token account if needed (~0.002 SOL rent) and transfers the tokens — so the
treasury needs both SOL (fees + rent) and token balance ≥ outstanding codes ×
amount. This key lives on the server, i.e. a hot wallet — prefer `TREASURY_SECRET_KEY`
injected from a secret manager over a file on disk:

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

1. Create the mint (same chain or mainnet): `scripts/create-mint.ts`. Hand it the
   treasury from your secret manager rather than a file on the build host:
   `TREASURY_SECRET_KEY='[12,34,...]'` (JSON byte array or base58) — a key passed
   that way is never copied into `.keys/`. `MINT_SECRET_KEY` does the same for a
   pre-generated mint address.
2. Fund the treasury: claim pool of tokens + SOL for rent/fees. On mainnet there is
   no airdrop, so the treasury needs >= 1 SOL before the script will run.
3. Point the deployment at it: `MINT=<new> TREASURY_SECRET_KEY=<funded>`.
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
