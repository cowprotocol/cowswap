---
title: Real Solana quotes (Jupiter-sourced) and CoW order posting
date: 2026-08-31
status: approved
owner: alexandr@cow.fi
---

# Real Solana quotes (Jupiter-sourced) and CoW order posting

## Why

`fetchSwapQuote` in `cowswap-frontend` currently serves a hand-rolled 1:1 mock
(`getSolanaMockQuote`) for every Solana swap, and its `postSwapOrderFromQuote`
always rejects. We need real quotes (sourced from Jupiter's API) and a real
`postSwapOrderFromQuote` — but "real" for Solana does not mean what it means
for EVM.

Solana settlement is not live on the CoW Protocol backend yet, but the
on-chain settlement program is public and its client interface crate
(`cow-settlement-interface`, from `github.com/cowprotocol/solana-programs`,
released as `v0.3.0`) is real, versioned, and installable. **Orders are
created entirely on-chain**: a `CreateOrder` instruction is submitted
directly to the settlement program by the owning wallet. There is no
order-creation REST endpoint on the CoW order-book, and none is planned — the
(draft, unmerged) Solana order-book API is quote/read-only. This is
fundamentally different from the EVM flow (`OrderSigningUtils.signOrder` +
`orderBookApi.sendOrder`), so `TradingSdk`'s EIP-712/adapter machinery
(`AbstractProviderAdapter`, `AbstractSigner`) does not apply and is not
extended.

We're building ahead of backend readiness, matching how the CoW Solana crates
(`solana-driver`, `solana-orderbook`, `solana-indexer`, ...) are already fully
built and merged in the `services` backend repo even though order-creation
support isn't wired up end-to-end yet.

## Constraints decided up front

| Decision | Choice | Rationale |
|---|---|---|
| Quote source | Jupiter's `/order` API, client named `JupiterAPI` | Real swap-rate data; only quote source available for Solana today. |
| Settlement program | `cow-settlement-interface` v0.3.0, program id `FYp8R5K4B3B1Kfr7QuWzMz4TwoT7wptjYtxgCrY5sRXb` | Confirmed released version (github.com/cowprotocol/solana-programs releases/tag/v0.3), supersedes the stale `moosEjJg...`/`J516Mv7Y...` ids found in `cow-sdk`/`services`. |
| Order creation mechanism | On-chain `CreateOrder` instruction, not an orderbook POST | Matches the real settlement program; no POST-order endpoint exists or is planned. |
| Implementation home | `cow-sdk` repo, new module `packages/trading/src/solana/` | Reusable by any dApp consuming `@cowprotocol/sdk-trading`; kept separate from `TradingSdk`'s EVM-only adapter stack rather than contorting it. |
| Token account resolution | `@solana/spl-token` (new dependency for `packages/trading`) | Standard ATA derivation; the settlement program's intent wants token accounts, not mints. |
| Signing/submission | `postSwapOrderFromQuote` takes a caller-supplied `signAndSend(transaction) => Promise<{ signature }>` callback | `cow-sdk` has no Solana wallet/signing abstraction (unlike EVM's adapter-bound signer); the callback seam keeps the SDK wallet-library-agnostic. `cowswap-frontend` supplies it via existing wallet-provider plumbing. |
| `cowswap-frontend` consumption during dev | Local `pnpm link` / workspace path override to the `cow-sdk` checkout | Nothing here is published (backend can't accept these instructions yet). |

## Wire format (ported 1:1 from `cow-settlement-interface` Rust source)

Source of truth: `interface/src/data/intent.rs`, `interface/src/instruction/create_order.rs`,
`interface/src/pda/{mod,order}.rs` in `cowprotocol/solana-programs` (tag `v0.3`).

**`OrderIntent` → canonical 213-byte `EncodedOrderIntent`** (all multi-byte
integers little-endian):

| Field | Bytes | Offset |
|---|---|---|
| `owner` (Pubkey) | 32 | 0 |
| `buy_token_account` (Pubkey, owner's buy-side ATA) | 32 | 32 |
| `buy_mint` (Pubkey) | 32 | 64 |
| `sell_token_account` (Pubkey, owner's sell-side ATA) | 32 | 96 |
| `sell_mint` (Pubkey) | 32 | 128 |
| `sell_amount` (u64 LE) | 8 | 160 |
| `buy_amount` (u64 LE) | 8 | 168 |
| `valid_to` (u32 LE, unix seconds) | 4 | 176 |
| `flags` (1 byte: bit0 `created_on_chain`, bit1 `kind` [0=Sell,1=Buy], bit2 `partially_fillable`) | 1 | 180 |
| `app_data` (opaque) | 32 | 181 |

Total: 213 bytes. `created_on_chain` **must be `true`** — that's the flag
this instruction authenticates against (the alternative, an off-chain
Ed25519-presigned flow, is a different, unused instruction path).

- **`uid`** = SHA-256 of the 213 bytes above. Doubles as the order UID and the
  middle PDA seed.
- **`order_pda`** = `findProgramAddress([SETTLEMENT_SEED, uid, "order"], programId)`,
  where `SETTLEMENT_SEED` = ASCII `"settlement v"` + the crate's
  `major.minor` (`"0.3"`) right-padded with spaces to a fixed 7-byte field
  (i.e. `"settlement v0.3    "`, 19 bytes total) — the fixed width and
  version-embedding exist specifically to prevent cross-version PDA
  collisions, so this string must be updated in lockstep with any future
  settlement-program version bump.
- **`CreateOrder` instruction**: `data = [0x02, ...213 intent bytes]` (214
  bytes; discriminator `2`). Accounts, in this exact order:
  1. `owner` — readonly, signer
  2. `created_by` — writable, signer (funds the order PDA's rent; may equal `owner`)
  3. `order_pda` — writable, not signer
  4. System Program — readonly, not signer

## Architecture

```
cow-sdk (packages/trading/src/solana/)
├── jupiterApi.ts        JupiterAPI client — GET quote endpoint, minimal typed response
├── orderIntent.ts        OrderIntent type + encodeOrderIntent()/hashOrderIntent() (ports the
│                          213-byte layout above, unit-testable against the Rust encoding
│                          regression fixture bytes)
├── orderPda.ts            SETTLEMENT_SEED + findOrderPda()
├── createOrderInstruction.ts   builds the CreateOrder TransactionInstruction
├── getSolanaQuote.ts       orchestrates: call JupiterAPI → build OrderIntent from the
│                          real quote amounts → compute uid/orderPda → return SolanaQuoteAndPost
└── index.ts                public exports

cowswap-frontend
├── modules/tradeQuote/services/getSolanaJupiterQuote.ts   (replaces getSolanaMockQuote.ts)
│     thin adapter: builds solana/spl-token ATA addresses, calls cow-sdk's getSolanaQuote(),
│     adapts the result into the QuoteAndPost shape fetchAndProcessQuote.ts expects
└── (postSwapOrderFromQuote's signAndSend callback obtains provider/publicKey via
    reownAppKit.getProvider('solana') / getAddressByChainNamespace('solana'), signs with
    provider.signTransaction, and submits via a Connection — reusing the retry logic in
    modules/trade/services/solanaSend/sendSolanaTransaction.ts)
```

`fetchAndProcessQuote.ts`'s Solana branch (currently line ~137-144, bypassing
the try/catch) becomes an `await` of the real async call, routed through the
existing `processQuoteError` path like the EVM branch — since this is now a
genuine fallible network call (Jupiter), not a pure computation.

### `QuoteAndPost` shape for Solana

Reuses the existing `@cowprotocol/sdk-trading` `QuoteAndPost`/`QuoteResults`
TypeScript shape (so `fetchAndProcessQuote.ts`/`useTradeQuoteManager` need no
changes), populated as:

- `quoteResults.quoteResponse.quote` — real `sellAmount`/`buyAmount` from
  Jupiter, `validTo` from our own TTL policy (Jupiter doesn't hand us order
  validity the way CoW does).
- `quoteResults.amountsAndCosts` — computed via the existing
  `getQuoteAmountsAndCosts` helper from the real amounts; `suggestedSlippageBps`
  from Jupiter's `slippageBps`.
- `quoteResults.tradeParameters` / `orderToSign` / `appDataInfo` /
  `orderTypedData` — stay stubbed (`{} as ...`). These are EIP-712/CoW-appData
  concepts with no counterpart in the Solana intent model (confirmed from the
  real struct — there's no `feeAmount`, `signingScheme`, or typed-data domain
  in `OrderIntent` at all, so this isn't a gap to fake, it's a real absence).
- `postSwapOrderFromQuote(signAndSend)` — builds the real `CreateOrder`
  instruction from the already-fetched intent, wraps it in a `Transaction`,
  calls the caller-supplied `signAndSend`, and returns
  `{ orderId: uid, txHash: signature }` (the two fields that have a genuine
  Solana equivalent; `signingScheme`/`signature`/`orderToSign` on
  `OrderPostingResult` are typed as EVM concepts with no Solana equivalent —
  left as documented sentinel stubs, matching the "mock only what's actually
  unavailable" instruction).

## Known open risks (flagged, not blocking — this is deliberately built ahead of backend readiness)

1. **The settlement program is not deployed/reachable in any environment
   `cowswap-frontend` currently targets.** `postSwapOrderFromQuote` will build
   and sign a real instruction/transaction, but submitting it will fail until
   the backend/protocol side lands. This is expected and matches "prepare
   everything, assume backend support lands soon."
2. **`app_data`** has no defined Solana convention yet — sent as 32 zero
   bytes, clearly commented as a placeholder.
3. If the settlement program's version moves past `v0.3` before backend
   support lands, `SETTLEMENT_SEED` and the program id both need a matching
   update — kept as two clearly-named, together-located constants specifically
   so that update is a one-place change.

## Non-goals

- `BeginSettle`/`FinalizeSettle` (actual settlement/matching) — backend-only,
  out of scope.
- Extending `TradingSdk`/`AbstractProviderAdapter` to be chain-generic — the
  Solana path is intentionally a parallel, independent module, not a new
  adapter implementation.
- Publishing the new `cow-sdk` module to npm — consumed via local link only,
  since it can't function against any live backend yet.

## Testing

- `orderIntent.ts`: unit tests against the Rust crate's own encoding
  regression fixture (`sample_intent` with `created_on_chain: true, kind:
  Buy, partially_fillable: true` → known 213-byte output and known SHA-256
  digest, both quoted verbatim in the Rust source) — a byte-for-byte port
  should reproduce that exact digest.
- `orderPda.ts`: unit test that `SETTLEMENT_SEED` round-trips to the expected
  ASCII bytes and ordinary `findProgramAddress` behavior.
- `getSolanaJupiterQuote.ts` / `getSolanaQuote.ts`: mock `fetch` for
  `JupiterAPI`, assert the resulting `QuoteAndPost` shape.
- `fetchAndProcessQuote.test.ts`: update the existing Solana-branch
  assertions for the new async call + `processQuoteError` routing.
