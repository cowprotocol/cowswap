# Solana order creation in Limit Orders — prototype design

Date: 2026-07-16
Branch: `solana/web-3`
Status: approved

## Goal

A working prototype that creates a CoW Protocol order on Solana mainnet from the Limit Orders UI. Limit Orders is used (not Swap) because the backend cannot quote Solana pairs yet — the price is entered manually. Success = the `CreateOrder` transaction lands on-chain and the user gets a Solscan link.

## Context

- Settlement program (mainnet): `moosEjJg5mbGRPRU7Vg4AaHZLvbbgknevWR9J1bNgME`
  (source: https://github.com/cowprotocol/solana-programs)
- Example create-order tx: `4hy8scaTfLNyJiAPbF47k4YWyWmE2CFfvLj6zkTUibpknEcNfjWWDyCT185qDbRYYLMtdDzGkVtuNXJEE2oXE6JG`
- On this branch, Solana already has: Reown AppKit `SolanaAdapter` wallet connection (behind the
  `IS_SOLANA_ENABLED` localStorage flag), `SupportedChainId.SOLANA` in `useWalletInfo()`,
  RPC via `useAppKitConnection()`, SPL/Token-2022 balances. There is **no** Solana
  transaction-signing code anywhere yet.
- Limit orders placement pipeline: `useTradeFlowContext` (EVM-only context assembly) →
  `useHandleOrderPlacement` (dispatch) → `tradeFlow` / `safeBundleFlow` →
  `tradingSdk.postLimitOrder`.

## Decisions (agreed with user)

| Topic | Decision |
| --- | --- |
| Integration approach | Third placement strategy (`solanaOrderFlow`) next to `tradeFlow`/`safeBundleFlow` |
| Cluster | Mainnet only |
| Native SOL | Not supported — SPL tokens only (no wrap flow) |
| Order params | `valid_to` from the existing deadline setting, `partially_fillable` from the existing settings toggle, `app_data` = 32 zero bytes |
| Post-create UX | Success toast/snackbar with tx signature → Solscan link + order UID; no orders-table integration |
| Recipient | Always the owner (no custom recipient) |

## On-chain interface (from cowprotocol/solana-programs)

`CreateOrder` instruction:

- Data: `[discriminator = 2, ...150 intent bytes]` (151 bytes total).
- Accounts: `[owner (signer, readonly), created_by (signer, writable), order_pda (writable), system_program (readonly)]`. We use `created_by = owner`.
- Intent encoding, 150 bytes, amounts/timestamps little-endian:
  `owner(32) ‖ buy_token_account(32) ‖ sell_token_account(32) ‖ sell_amount(u64) ‖ buy_amount(u64) ‖ valid_to(u32) ‖ kind(u8: 0=sell, 1=buy) ‖ partially_fillable(u8) ‖ app_data(32)`.
  Token accounts are SPL token accounts (ATAs), **not** mints. The sell token account must be
  owned by the intent owner.
- `uid = sha256(intent bytes)`.
- Order PDA: `findProgramAddress(["settlement", uid, "order"], programId)`.
- Settlement state PDA (the SPL delegate): `findProgramAddress(["settlement"], programId)`.

## 1. Architecture & data flow

New code lives inside `apps/cowswap-frontend/src/modules/limitOrders`:

- `services/solanaOrderFlow/`
  - `index.ts` — `solanaOrderFlow(ctx)`: builds the tx, sends it via the Reown Solana
    provider, awaits confirmation, returns `{ signature, orderUid }`.
  - `buildCreateOrderTx.ts` — pure function from resolved params to a `Transaction`
    (testable without a wallet): intent encoding, UID hashing, PDA derivation,
    instruction construction.
  - `const.ts` — program ID, seeds (`"settlement"`, `"order"`), discriminator `2`,
    intent size `150`.
- `hooks/useSolanaTradeFlowContext.ts` — Solana counterpart of `useTradeFlowContext`
  (which hard-requires a wagmi `walletClient` and returns `null` on Solana). Gathers:
  owner pubkey (`useWalletInfo`), `connection` (`useAppKitConnection`), Solana
  `walletProvider` (`useAppKitProvider('solana')`), sell/buy token (base58 address,
  decimals, `extensions.isToken2022`), sell/buy amounts as `bigint` from
  `useLimitOrdersDerivedState`, `validTo` from the deadline setting,
  `partiallyFillable` from the limit-orders settings.
- Dispatch in `hooks/useHandleOrderPlacement.ts`: `isSolanaChain(chainId)` →
  `solanaOrderFlow(solanaCtx)`, checked before the existing `isSafeBundle` /
  `tradeFlow` branches. EVM paths are untouched.

No new npm packages: `@solana/web3.js@1.98.4` and `@solana/spl-token@0.4.14` are already
in the workspace; SHA-256 comes from `@noble/hashes` (already a transitive dependency;
synchronous, which PDA derivation requires).

## 2. Transaction building

One legacy `Transaction`, fee payer = owner, `recentBlockhash` from the connection,
three instructions in order:

1. **Create buy ATA, idempotent** — `createAssociatedTokenAccountIdempotentInstruction`
   for the buy mint, owned by the owner. Ensures the order is settleable.
2. **SPL `approve`** — delegate `sell_amount` on the owner's sell ATA to the settlement
   state PDA. Token program chosen per token: `TOKEN_2022_PROGRAM_ID` when the token has
   `extensions.isToken2022`, else `TOKEN_PROGRAM_ID`.
3. **`CreateOrder`** — as per the on-chain interface above.

The buy amount comes from the form, where it is derived from the manually entered rate
(existing `limitRateAtom` machinery — no quote involved). Sending uses the Reown Solana
provider's `sendTransaction(tx, connection)`; confirmation awaited at `confirmed`
commitment.

**Known limitation (accepted):** SPL token accounts have a single delegate, so a second
order's `approve` overwrites the first order's remaining delegated allowance. Fine for a
prototype; noted for the production design.

## 3. UI gating & validation

- Entry path: user enables `IS_SOLANA_ENABLED`, picks Solana in the network selector
  (already listed behind the flag), opens Limit orders. Token selection and balances
  already work on this branch.
- Form readiness on Solana is implemented in a dedicated `SolanaTradeButtons` container
  inside `modules/limitOrders` (rendered by the existing `TradeButtons` when
  `isSolanaChain(chainId)`), instead of adding a Solana path to the shared
  `modules/tradeFormValidation` — that module's validation context is fed by EVM-only
  hooks shared with swap/twap, so bypassing it wholesale is safer for a prototype. The
  Solana button ladder: wallet connected → tokens selected → amounts set → sufficient
  balance → place order. Quote, approval (EVM allowance), and permit checks never apply.
- Quote polling is skipped for Solana with an `isSolanaChain` guard in
  `modules/tradeQuote/hooks/useQuoteParams.ts` (no backend quote exists). Initial-price
  and market-rate updaters use USD price feeds and fail soft (null) on Solana — no
  guards needed; the price is typed manually.
- Post-create UX: success snackbar/toast with the tx signature linking to Solscan and the
  order UID. No orders-table/history integration.

## 4. Error handling & testing

- Wallet rejection → existing "user rejected" handling; send/RPC failures → error toast
  with the underlying message. No retries, no priority fees.
- Unit tests for `buildCreateOrderTx` using regression vectors from the Rust repo:
  - The sample intent (`owner=[0x11;32]`, `buy=[0x22;32]`, `sell=[0x33;32]`,
    `sell_amount=0x0123456789abcdef`, `buy_amount=0xfedcba9876543210`,
    `valid_to=0xdeadbeef`, kind=Buy, partially_fillable=true, `app_data=[0x44;32]`)
    must encode to the byte string pinned in the Rust test
    (`interface/src/data/intent.rs::encoding_regression`) and hash to UID
    `7ce7c6a74671090771fa33851387444064aca759ce55b80708723076722f5e00`.
  - PDA derivation checked against the known example transaction.
  - Instruction data/account layout assertions (discriminator, account order, flags).
- Manual e2e: create a small USDC↔WSOL order on mainnet and verify the tx on Solscan
  against the example transaction.

## Out of scope

Order history/display, order cancellation, native SOL wrapping, custom recipient,
quotes/market price, real appData hash, versioned transactions/priority fees, devnet
support.
