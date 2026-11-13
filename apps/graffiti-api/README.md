# graffiti-api

Backend for the Graffiti Wall: a collaborative pixel canvas (3840×2160 by
default, see `CANVAS_WIDTH`/`CANVAS_HEIGHT`) where drawing costs one SPL token
per pixel, proven by an on-chain SPL burn.

Implements `docs/graffiti/SPEC.md`.

## Stack

Node 20+ / TypeScript, Fastify (REST), `ws` (WebSocket), better-sqlite3
(cells, claims, seen signatures/memos), `@solana/web3.js` + `@solana/spl-token`
(verification + claim transfers). A JSON-file store exists as a dev fallback
but must be opted into with `ALLOW_JSON_STORE=1`; it is not safe under
concurrency.

## Quick start (dev, no mint yet)

The package is part of the pnpm workspace; install from the repo root.

```bash
pnpm install
pnpx nx run graffiti-api:build
cd apps/graffiti-api
DEV_INSECURE=1 node dist/src/server.js   # http://localhost:3199
```

Or run it straight from source with `pnpx nx run graffiti-api:serve`.

Point the frontend at it with an absolute URL (the API allows any origin unless
`CORS_ORIGINS` is set, and the WebSocket URL is derived from it):

```bash
REACT_APP_GRAFFITI_API=http://localhost:3199/v1 \
REACT_APP_SOLANA_CLUSTER=devnet \
REACT_APP_BOOT_FEATURE_FLAGS='{"isSolanaEnabled":true}' \
pnpm start:cowswap
```

Leaving `REACT_APP_GRAFFITI_API` unset means same-origin `/v1`, for deployments
that serve the built frontend from this API via `STATIC_DIR`.

`DEV_INSECURE=1` **skips on-chain burn verification** (draws are accepted
without a real burn tx; claims don't transfer) so the frontend can be
end-to-end tested before the mint exists. The server refuses to start with it
set when `NETWORK` is a mainnet cluster or `NODE_ENV=production`.

## Devnet token setup

```bash
pnpx nx run graffiti-api:build
node dist/scripts/create-mint.js
```

Creates the mint (decimals 0), mints `INITIAL_SUPPLY` (default 10,000,000) tokens
to a fresh treasury,
saves keypairs under `.keys/` (gitignored) and prints `MINT` / `TREASURY`.
Then run the real server:

```bash
MINT=<mint-pubkey> \
TREASURY_KEYPAIR=$PWD/.keys/treasury.json \
ADMIN_TOKEN=$(openssl rand -hex 32) \
node dist/src/server.js
```

### Supplying keys to the script from the environment

`create-mint.ts` takes the keys it signs with from the environment, in the same
two encodings the server accepts — a `solana-keygen` JSON byte array
(`[12,34,...]`) or a base58 string:

| Var | What it overrides |
| --- | --- |
| `TREASURY_SECRET_KEY` | The treasury (payer, mint authority, supply holder). Beats `TREASURY_KEYPAIR`. |
| `TREASURY_KEYPAIR` | Path to a treasury keypair file, in either encoding. Beats `.keys/treasury.json`. |
| `MINT_SECRET_KEY` | A pre-generated (e.g. vanity) mint address. Defaults to `.keys/mint.json`. |

```bash
TREASURY_SECRET_KEY="$(cat /secure/treasury.json)" \
  pnpm mint:create -- --rpc <rpc-url>
```

A key supplied this way is **never written to `.keys/`** — one held in a secret
manager should not come to rest on the build host's disk. Only keypairs the
script generates itself are persisted, so a run that supplies both keys writes
nothing. A secret that is set but unparseable, or a `TREASURY_KEYPAIR` path that
cannot be read, aborts the run rather than silently falling back to a fresh,
unfunded treasury.

Prefer the env var over a shell argument: arguments land in shell history and are
visible to every process via `ps`. Read it from a file or a secret manager as
above rather than typing it inline.

### Naming the token in wallets

A bare SPL mint has no name, so wallets show it as UNKNOWN. `set-token-metadata.ts`
attaches a Metaplex Token Metadata account to the mint — name, symbol and a link to
the off-chain JSON that carries the logo:

```bash
MINT=<mint-pubkey> TREASURY_KEYPAIR=$PWD/.keys/treasury.json pnpm token:metadata
```

Re-runnable: it creates the account the first time and updates it afterwards.
`TOKEN_NAME` / `TOKEN_SYMBOL` / `TOKEN_URI` override the defaults (`GRASS`,
`GRASS`, `https://swap.cow.fi/token/grass.json`). The JSON and the PNG it points
at live in `apps/cowswap-frontend/public/token/`; deploying under another domain
means editing the absolute URLs in `grass.json` and passing a matching
`TOKEN_URI`. See `docs/graffiti/OPERATIONS.md` section 6.

## Configuration (env)

| Var                    | Default                          | Description                                                        |
| ---------------------- | -------------------------------- | ------------------------------------------------------------------ |
| `PORT`                 | `3199`                           | HTTP/WS port                                                        |
| `HOST`                 | `0.0.0.0`                        | Bind address                                                        |
| `RPC_URL`              | `https://api.devnet.solana.com`  | Solana RPC endpoint                                                 |
| `NETWORK`              | `devnet`                         | Cluster; `mainnet`/`mainnet-beta` enables production guards         |
| `MINT`                 | —                                | Graffiti SPL mint pubkey (required unless `DEV_INSECURE`)           |
| `TREASURY_KEYPAIR`     | —                                | Path to treasury keypair JSON (claims payer)                        |
| `TREASURY_SECRET_KEY`  | —                                | Treasury key inline (base58 or JSON array); takes precedence        |
| `GRAFFITI_DB`          | `data/graffiti.db`               | SQLite path                                                         |
| `ALLOW_JSON_STORE`     | `0`                              | `1` = permit the dev-only JSON fallback store                       |
| `DEV_INSECURE`         | `0`                              | `1` = skip on-chain verification (refused on mainnet/production)    |
| `ADMIN_TOKEN`          | —                                | Bearer token for `/v1/admin/*`; **unset disables those routes**     |
| `COMMIT_HASH`          | — (`unknown` in the image)       | Commit the image was built from; CI sets it, served as `commit` on `/v1/info` |
| `CORS_ORIGINS`         | `*` (required in production)     | Comma-separated allowed origins, also enforced on the WebSocket     |
| `TX_MAX_AGE_SEC`       | `3600`                           | Max age of an accepted draw tx and of its memo timestamp            |
| `VERIFY_COMMITMENT`    | `finalized`                      | Commitment used to read the burn back (`confirmed` is weaker)       |
| `CLAIM_CONFIRM_TIMEOUT_MS` | `75000`                      | How long a claim polls for its transfer before parking the code     |
| `MAX_CELLS_PER_DRAW`   | `20000`                          | Draw size limit                                                     |
| `MAX_CELLS_PER_PAGE`   | `50000`                          | Page size for `GET /v1/cells`                                       |
| `RATE_LIMIT_PER_MINUTE`| `60`                             | Per-IP budget for write endpoints (reads get 10×)                   |
| `WS_MAX_CLIENTS`       | `2000`                           | Max simultaneous WebSocket clients                                  |
| `WS_HEARTBEAT_MS`      | `30000`                          | Ping interval for dropping half-open sockets                        |
| `CANVAS_WIDTH`         | `3840`                           | Wall width in cells; pin it per environment, see below              |
| `CANVAS_HEIGHT`        | `2160`                           | Wall height in cells; pin it per environment, see below             |
| `MAX_BOX_WIDTH`        | `256`                            | Max bounding box of one draw (long side)                            |
| `MAX_BOX_HEIGHT`       | `128`                            | Max bounding box of one draw (short side)                           |
| `STATIC_DIR`           | —                                | Serve a built frontend from this directory                          |

### Production checklist

- `ADMIN_TOKEN` set — without it `/v1/admin/*` returns 503 rather than running unauthenticated.
- `CORS_ORIGINS` set to the real origins; the server refuses to start on a production
  `NETWORK` without it.
- `DEV_INSECURE` and `ALLOW_JSON_STORE` unset.
- Treasury key supplied via `TREASURY_SECRET_KEY` from a secret manager rather than a file on disk.
- Rate limiting is per process: with several replicas, divide `RATE_LIMIT_PER_MINUTE` accordingly.
- Watch `GET /v1/admin/claims/failed` — codes land there when a transfer was submitted but
  could not be confirmed, and need an operator to check the chain before releasing them.

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

Ops generates codes with `pnpm --filter @cowprotocol/graffiti-api run claims:gen -- --n 20 --amount 5000`,
or via `POST /v1/admin/claims` with the `ADMIN_TOKEN` bearer header.
(or `POST /v1/admin/claims`). Codes are random 22-char base58 ids, single
use. QR encodes `<app-url>/#/graffiti/claim?code=<id>`; claiming transfers
`amount` tokens from the treasury ATA to the claimer (ATA created and fees
paid by the treasury keypair).
