# graffiti-api

Backend for the Graffiti Wall: a collaborative 512×512 pixel canvas where
drawing costs one SPL token per pixel, proven by an on-chain SPL burn.

Implements `docs/graffiti/SPEC.md`.

## Stack

Node 20+ / TypeScript, Fastify (REST), `ws` (WebSocket), better-sqlite3
(cells, claims, seen signatures/memos; automatic JSON-file fallback if the
native module is unavailable), `@solana/web3.js` + `@solana/spl-token`
(verification + claim transfers).

## Quick start (dev, no mint yet)

```bash
cd apps/graffiti-api
npm install
npm run build
DEV_INSECURE=1 npm start        # http://localhost:3000
```

`DEV_INSECURE=1` **skips on-chain burn verification** (draws are accepted
without a real burn tx; claims don't transfer) so the frontend can be
end-to-end tested before the mint exists. Never enable it in production.

## Devnet token setup

```bash
npm run mint:create
```

Creates the mint (decimals 0), mints 1,000,000 tokens to a fresh treasury,
saves keypairs under `.keys/` (gitignored) and prints `MINT` / `TREASURY`.
Then run the real server:

```bash
MINT=<mint-pubkey> \
TREASURY_KEYPAIR=$PWD/.keys/treasury.json \
npm start
```

## Configuration (env)

| Var               | Default                        | Description                          |
| ----------------- | ------------------------------ | ------------------------------------ |
| `PORT`            | `3000`                         | HTTP/WS port                         |
| `RPC_URL`         | `https://api.devnet.solana.com`| Solana RPC endpoint                  |
| `NETWORK`         | `devnet`                       | Label reported by `/v1/info`         |
| `MINT`            | —                              | Graffiti SPL mint pubkey             |
| `TREASURY_KEYPAIR`| —                              | Path to treasury keypair JSON (claims payer) |
| `GRAFFITI_DB`     | `data/graffiti.db`             | SQLite (or JSON fallback) path       |
| `DEV_INSECURE`    | `0`                            | `1` = skip on-chain verification     |
| `ADMIN_TOKEN`     | —                              | Bearer token for `/v1/admin/claims`  |
| `TX_MAX_AGE_SEC`  | `90`                           | Max age of an accepted draw tx       |
| `MAX_CELLS_PER_DRAW` | `20000`                     | Draw size limit                      |

## API (`/v1`)

| Method | Path              | Description |
| ------ | ----------------- | ----------- |
| GET    | `/v1/canvas.png`  | Current canvas as 8-bit RGB PNG |
| GET    | `/v1/info`        | `{width, height, mint, treasury, network, feePayerHint}` |
| GET    | `/v1/cells?since=<seq>` | `{seq, cells:[[x,y,rgb],...]}` polling fallback |
| POST   | `/v1/draw`        | `{ok, seq}` — body `{txSignature, walletPubkey, cells:[{x,y,color}]}` |
| POST   | `/v1/claim`       | `{ok, txSignature, amount}` — body `{code, walletPubkey}` |
| GET    | `/v1/claim/:code` | `{valid, amount}` |
| POST   | `/v1/admin/claims`| `{ok, codes:[{code, amount}]}` — body `{n, amount}` (guard with `ADMIN_TOKEN`) |
| GET    | `/v1/stats`       | `{paintersOnline}` |
| WS     | `/ws`             | pushes `{type:"diff", seq, cells}` and `{type:"stats", paintersOnline}` |

### Draw verification (non-dev mode)

For each `POST /v1/draw` the server fetches the tx by signature from the RPC
and checks: status ok, ≤ 90 s old, contains a Burn/BurnChecked on the graffiti
mint with amount ≥ cell count, the burner (token-account owner or burn
authority) equals the posted wallet pubkey, and a memo
`graffiti:v1:<pubkey>:<ts>` inside the freshness window. Signatures are stored
forever and memos are unique per pubkey — both reject replays.

## Claim codes

Ops generates codes: `npm run claims:gen -- --n 20 --amount 1000`
(or `POST /v1/admin/claims`). Codes are random 22-char base58 ids, single
use. QR encodes `<app-url>/#/graffiti/claim?code=<id>`; claiming transfers
`amount` tokens from the treasury ATA to the claimer (ATA created and fees
paid by the treasury keypair).
