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

Against a running server (the codes land in the live DB immediately):
```bash
curl -sS -X POST https://<host>/v1/admin/claims \
  -H 'authorization: Bearer <ADMIN_TOKEN>' \
  -H 'content-type: application/json' \
  -d '{"n": 1000, "amount": 1000}' > codes.json
jq '.codes | length' codes.json   # → 1000
```
`n` is clamped to 1000 per request, so 1000 codes is exactly one call; for more,
repeat the call and concatenate. The `content-type` header is required — without
it Fastify rejects the body.

Offline, or before the server is up (writes straight to the SQLite file; point it
at the same DB the server uses):
```bash
cd apps/graffiti-api
GRAFFITI_DB=data/graffiti.db pnpm claims:gen -- --n 1000 --amount 1000 > data/codes.txt
```
Codes go to stdout one per line, the summary to stderr — so the redirect above
gives a clean list. Both outputs feed the PDF step below.

**Before printing 1000 codes, fund the treasury for them.** 1000 × 1000 tokens is
1,000,000 units — the whole initial supply that `scripts/create-mint.ts` mints —
and the server pays each claimer's account rent, so it also needs
**~2.1 SOL** (1000 × ~0.00204 SOL ATA rent + fees). Check both before the event,
not during it.

Codes are **database rows, not on-chain objects**: unlimited, generable in
advance, and they survive a token migration — the QR only contains
`domain + code`; which mint backs them is server config (`MINT`). Print QRs
before the final token exists if you like; swap `MINT` later and they pay out
the new token.

### Print claim cards

`scripts/make-claim-pdf.ts` turns a code list into a print-ready PDF: 12 cards
per A4 page (3 x 4 squares of 64.7 mm, the largest 12-up square A4 allows),
each card the artwork at full bleed with crop marks in the paper margin.

The artwork (`assets/cows-in-love.png`) reserves two zones and the script fills
them: the white splash panel takes the headline, the submessage and the code —
its three placeholder rules are painted out — and the framed square takes the
QR, over its placeholder brackets. Zone coordinates live in `ART_TEXT_BOX` /
`ART_QR_BOX` as fractions of the card; new artwork needs them re-measured, or
passed as `--text-box` / `--qr-box`.

```bash
cd apps/graffiti-api

# 1. proof one page first — cut a card out and scan it off paper
pnpm claims:pdf -- --codes data/codes.txt --base-url https://swap.cow.fi \
  --limit 12 --out data/proof.pdf

# 2. the full run: 1000 codes -> 84 pages, ~4 MB
pnpm claims:pdf -- --codes data/codes.txt --base-url https://swap.cow.fi \
  --out data/claim-cards.pdf
```

`--codes` takes either the one-per-line list or the admin endpoint's JSON.
Duplicates are dropped with a warning; `pnpm claims:pdf -- --help` lists every
flag. Relative paths resolve against `apps/graffiti-api/`, and `data/` is
gitignored — keep the code list and the PDF there so neither is ever committed.
`--image none` renders the layout as a grey proof, without the artwork.

**Check the module size the run reports.** It prints e.g.
`QR 16.6mm at 37 modules (ecc M) -> 0.41mm per module`, and that number, not the
print resolution, decides whether a phone reads the card. Below 0.40 mm it warns.
Three levers, in order of effect: a shorter `--base-url` (the claim URL is 63
characters today, which costs a whole QR version), `--ecc L` (fewer modules, less
damage tolerance), or fewer cards per page. Print the proof, cut one card out and
scan it with a phone before committing to 84 pages.

Type is set in Permanent Marker (headline) and Barlow Condensed (body), bundled
under `assets/fonts/` with their licences; `--font-display` / `--font-body` take
any other TTF. Sizes are not fixed: the script fits the headline, submessage and
code to the panel together, so changing `--main-text` / `--sub-text` reflows
rather than overflows. A warning is printed if the text cannot be made to fit.

Artwork must be **PNG or JPEG** (PDF embedding takes nothing else — convert an
SVG first, e.g. `magick -density 300 art.svg art.png`). Cards inherit the
image's aspect ratio, so a square asset gives square cards. Supply it at
>= 1200 px on the long edge for 300 dpi.

Printing: no scaling ("actual size", not "fit to page"), and a stock around
200-250 g/m². The artwork is embedded once and the QRs are vectors, so 1000
cards stay around 4 MB and stay sharp at any resolution. Cards tile edge to
edge by design: a slightly off cut shows a sliver of the neighbouring card
rather than a white edge.

**Treat the PDF like cash.** Every card is a bearer token for `amount` tokens;
anyone who photographs one can redeem it. Don't mail it around, and reprint from
fresh codes rather than reusing a leaked batch.

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
