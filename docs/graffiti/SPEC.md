# Graffiti Wall — spec (v1)

Fork of CoW Swap with a new page: a collaborative graffiti canvas where drawing
costs an SPL token per pixel. Freehand strokes, rasterized to a pixel grid.

## Decisions (locked 2026-11-06)
- Drawing: freehand strokes via `perfect-freehand`, rasterized to pixel grid.
- Cost: 1 token per pixel cell covered by the stroke.
- Token: NEW SPL token we mint. Decimals: 0. Devnet first, mainnet later.
- Canvas state: small backend (REST + WebSocket), draw rights proven by an
  on-chain SPL `Burn` of the graffiti token.
- QR codes: each encodes a claim URL; claiming transfers tokens from a
  treasury token account to the claimer's wallet, one use per code.

## Canvas
- Grid: 512 x 512 cells. Each cell: RGB color (24-bit), no alpha layering —
  latest write wins.
- A stroke = array of {x, y} float points in canvas coords + color + brush
  size. Client rasterizes with perfect-freehand `getStroke` outline, then
  fills cells: any cell whose center is inside the outline polygon is set.
- Cost = number of NEW cells the stroke would change (repainting your own
  color on the same color is free? NO — v1: every covered cell costs 1,
  simple and predictable).

## Draw flow (client)
1. Wallet connects (Solana — reuse cowswap's appkit solana adapter).
2. User draws stroke → client computes covered cells + cost N.
3. User clicks "Paint (N PIXEL tokens)".
4. Client builds tx: SPL `BurnChecked` of N tokens from user's ATA of the
   graffiti mint + memo instruction containing ` graffiti:v1:<sig-pubkey>:<ts>`.
   User signs & sends.
5. After confirmation, client POSTs /draw with: tx signature, the cells
   [{x, y, color}], and its wallet pubkey.
6. Backend verifies (see below), applies, broadcasts diff to all sockets.

## Draw verification (backend)
- Fetch tx by signature (devnet RPC). Check:
  - status ok, recent (<= 90s old)
  - contains Burn/BurnChecked on THE graffiti mint, amount >= N
  - burner = claimed wallet pubkey (owner of the token account)
  - memo matches `graffiti:v1:<pubkey>:<ts>` (replay protection: memo ts
    unique per pubkey within window; also store seen signatures forever)
- On pass: apply cells, set cost burned := amount. Broadcast.

## Claim flow
- Ops pre-generates claim codes: random 22-char base58 ids, each with an
  amount (default 1000), stored server-side (single-use).
- QR encodes: `<app-url>/#/graffiti/claim?code=<id>` (landing opens wallet
  connect on mobile).
- POST /claim {code, walletPubkey} → server transfers `amount` tokens from
  treasury ATA to claimer (creates claimer ATA if needed), marks code used,
  returns tx signature.
- GET /claim/:code → {valid, amount} (no reveal of used/invalid beyond that).

## REST API (backend, `/v1`)
- GET  /canvas.png          → current canvas as PNG (8-bit RGB)
- GET  /info                → {width, height, mint, treasury, network, feePayerHint}
- GET  /cells?since=<seq>   → {seq, cells:[{x,y,color},...]}   (polling fallback)
- POST /draw                → body {txSignature, walletPubkey, cells:[{x,y,color}]}
                              → {ok, seq} | 4xx with reason
- POST /claim               → {ok, txSignature, amount} | 4xx
- GET  /claim/:code         → {valid, amount}
- WS   /ws                  → server pushes {type:"diff", seq, cells:[...]}
                              and {type:"stats", paintersOnline}

## Backend stack
- Node 20 + TypeScript, `ws`, `fastify`, `@solana/web3.js`, `@solana/spl-token`,
  SQLite (better-sqlite3) for cells + claims + seen signatures.
- Canvas state: single Buffer 512*512*3, seeded from SQLite on boot.
- Env: RPC_URL, MINT, TREASURY_KEYPAIR (claims payer), PORT, NETWORK.
- Lives in `apps/graffiti-api/` inside this repo (own package.json).

## Frontend
- Page: `apps/cowswap-frontend/src/pages/graffiti/` + route `/graffiti`
  (follow the CowRunner/MevSlicer lazy-route pattern in RoutesApp.tsx and
  Routes enum in common/constants/routes.ts).
- Self-contained page module: dark graffiti aesthetic, canvas center,
  color picker + brush size, live cost counter, wallet connect button,
  "Paint" flow (burn tx) with status states: drawing → quoting → awaiting
  wallet → confirming → painting → done/error.
- Claim page: `/graffiti/claim` reading ?code=, shows amount, connect wallet,
  claim button → POST /claim → success screen with balance.
- Perfect-freehand for stroke preview; rasterization utility shared by
  preview and final cost computation (pure TS function).
- Vite dev proxy `/v1` + `/ws` to localhost:3000 in dev.

## Token ops (devnet)
- `create-mint.ts` script in `apps/graffiti-api/scripts/`: creates mint
  (decimals 0), mints initial supply (1_000_000) to treasury, prints
  MINT + TREASURY pubkey. Keypairs under `apps/graffiti-api/.keys/` (gitignored).

## Non-goals v1
- No on-chain canvas state, no MACI/privacy, no moderation UI, no ERC-20 path.
