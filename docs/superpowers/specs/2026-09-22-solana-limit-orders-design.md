---
title: Add a Solana trading flow for limit orders
date: 2026-09-22
status: approved
owner: alexandr@cow.fi
---

# Add a Solana trading flow for limit orders

## Why

`modules/limitOrders` has no working Solana path. `useTradeFlowContext`
(`modules/limitOrders/hooks/useTradeFlowContext.ts`) is EVM-only — it depends
on `useWalletClient` (wagmi) and `useGP2SettlementContractData`, both of which
never resolve for a Solana account, so the hook always returns `null` on
Solana. `TradeButtons/index.tsx` papers over this with a hack
(`skipTradeContextReadyGate = isSolanaEnabled && isSolanaChain(chainId)`) that
unconditionally enables the confirm button on Solana without a real context to
back it — clicking through today would fall into
`useHandleOrderPlacement`'s EVM-only `tradeFlow(...)`
(`tradingSdk.postLimitOrder`), which is invalid for a Solana account.

Solana swaps already work end-to-end (`modules/tradeFlow/services/solanaFlow`):
quote → build an on-chain `CreateOrder` instruction → bundle it with
wrap/delegate/buy-ATA instructions into one transaction → send. There is no
REST "post order" step for Solana at all — everything is on-chain. The
order-creation step (`planCreateOrderStep` → the SDK's `buildSolanaSwapOrder`)
already reads `appData.metadata.orderClass.orderClass` and threads
`'limit'`/`'market'` into the on-chain instruction; only the caller side never
sets it to `'limit'`. Separately, `modules/tradeFlow`'s
`solanaFlow`/`buildSolanaOrder()` hardcodes `class: OrderClass.MARKET` on the
Redux-side `Order` object it stores — a real bug once a limit variant exists.

Two confirmed facts materially simplify this work:

- `@cowprotocol/sdk-trading-solana` (external SDK, not part of this repo)
  already supports `partiallyFillable` end-to-end: `SolanaQuoteParameters`
  accepts it, and it flows straight into the on-chain `SolanaOrderIntent`. No
  SDK change is needed.
- The LimitOrders page already renders
  `<AppDataUpdater orderClass="limit" .../>`
  (`pages/LimitOrders/LimitOrders.page.tsx:48`), so `useAppData()`'s
  `appData.doc.metadata.orderClass.orderClass` is already `'limit'` for the
  whole limit-orders page, on every chain. `planCreateOrderStep`'s existing
  `appData?.metadata?.orderClass?.orderClass === 'limit'` check will already
  resolve correctly once a Solana limit flow calls it — no change needed
  there.

`modules/tradeFlow` is shared infrastructure meant to serve every trading
widget (swap, limit, etc.), not a swap-owned module — `modules/limitOrders`
already depends on it for the EVM path's shared utilities
(`addPendingOrderStep`, `emitPostedOrderEvent`, `TradeFlowAnalytics`). This
design generalizes `solanaFlow` and its context type in place inside
`modules/tradeFlow`, and adds a `limitOrders`-owned context-assembly hook and
dispatcher branch that supplies limit-order state to it — mirroring exactly
how `modules/limitOrders` already owns its EVM `useTradeFlowContext`/`tradeFlow`
pair alongside swap's own `useTradeFlowContext`/`swapFlow` pair, while sharing
the underlying flow machinery.

## Constraints decided up front

| Decision | Choice | Rationale |
|---|---|---|
| Where `solanaFlow` lives | Stays in `modules/tradeFlow`, generalized in place | `modules/tradeFlow` is shared trading-flow infra, not swap-owned. Avoids duplicating ~150 lines of plan→send→build-Order→emit orchestration, and fixes the `OrderClass.MARKET` bug at the root once. |
| Where the new context-assembly hook lives | `modules/limitOrders/hooks/`, calling shared `modules/tradeFlow` utilities | Matches the existing convention: each widget owns its context-assembly hook and dispatch (`useTradeFlowContext` + `useHandleOrderPlacement` for limitOrders, `useSolanaTradeFlowContext` + `useHandleSwap`/`useTradeFlowType` for swap); only the low-level plumbing (`buildSolanaContextKey`, `buildSolanaTradeFlowContext`, `getIsSolanaTradeFlowContextReady`, `useSolanaSigner`, `sendSolanaFlow`, plan-step builders) is shared. |
| `FlowType`/`useTradeFlowType`/`useHandleSwap` | Left untouched, no `SOLANA_LIMIT` member added | These are swap's own dispatcher, built from swap-only gates (eth-flow, permit). `limitOrders` already has its own simpler dispatch in `useHandleOrderPlacement.ts` (Safe-bundle vs. regular); it gets a third branch, not a shared enum member. |
| Order classification | New explicit `orderClass: OrderClass` field on `SolanaTradeFlowContext`, not inferred from `uiOrderType` inside `solanaFlow` | Mirrors the EVM precedent where `postOrderParams.class` (protocol-level classification) is explicit and separate from `swapFlowAnalyticsContext.orderType`/`tradeFlowAnalyticsContext.orderType` (UI/analytics labeling). Avoids fragile enum-mapping logic inside `solanaFlow`. |
| `partiallyFillable` for Solana quotes | New `partiallyFillable: boolean` field on `SolanaTradeFlowContext`; also fix `getSolanaQuote.service.ts` and `LimitOrdersWidget` to actually thread it through at quote time | Unlike EVM (where `partiallyFillable` is set later, at order-post time, and doesn't need to be in the quote request), Solana's order intent is computed and hashed at quote time — `partiallyFillable` must already be correct in the quote request. |
| SDK changes | None | `@cowprotocol/sdk-trading-solana` already supports everything needed (`partiallyFillable`, `appData.metadata.orderClass`). |
| Scope | Includes fixing the `TradeButtons` readiness bypass and the quote-layer `partiallyFillable` gap | Both are loose ends the swap-flow's Solana wiring left specifically for limit orders to close; shipping without them leaves a known-broken UI gate and a silently-wrong on-chain field. |

## Architecture

```
modules/limitOrders/hooks/useHandleOrderPlacement.ts
        │
        ├─ isSolanaChain(chainId)?
        │        │
        │        ├─ yes → solanaContext = useSolanaTradeFlowContext()  (NEW, modules/limitOrders/hooks/)
        │        │          │                                             reads: useLimitOrdersDerivedState,
        │        │          │                                             limitOrdersSettingsAtom, calculateLimitOrdersDeadline
        │        │          ▼
        │        │        solanaFlow(solanaContext, analytics)   ← modules/tradeFlow/services/solanaFlow (GENERALIZED)
        │        │          │
        │        │          ├─ planWrapStep / planDelegateStep / planCreateBuyAtaStep / planCreateOrderStep
        │        │          │     (modules/trade/services/solanaFlow/* — unchanged, chain/order-type agnostic)
        │        │          ├─ sendSolanaFlow                     (unchanged)
        │        │          └─ buildSolanaOrder()                 (FIXED: class: context.orderClass, was hardcoded MARKET)
        │        │
        │        └─ no  → existing EVM branch: shouldUseSafeBundle ? safeBundleFlow(...) : tradeFlow(...)
        │                    (modules/limitOrders/services/*, unchanged)
        ▼
  LimitOrdersWidget / TradeButtons
        isTradeContextReady = isSolanaChain(chainId) ? !!solanaContext : !!tradeContext   (FIXED, was a bypass hack)
```

The swap widget's own path (`modules/tradeFlow/hooks/useSolanaTradeFlowContext.ts`
→ `useHandleSwap.ts` → `solanaFlow`) is structurally unchanged — it now just
supplies two additional fields (`orderClass: OrderClass.MARKET`,
`partiallyFillable: false`) to the generalized context type.

## Type changes

`modules/tradeFlow/types/TradeFlowContext.ts` (`SolanaTradeFlowContext`):

- Add `orderClass: OrderClass` and `partiallyFillable: boolean` inside
  `context: { ... }`.
- Rename the `swapFlowAnalyticsContext` field to `tradeFlowAnalyticsContext`
  on both `SolanaTradeFlowContext` and `TradeFlowContext`. Pure rename, no
  behavior change — the field's type (`TradeFlowAnalyticsContext`) is already
  generic; only its name was swap-specific. Every construction/consumption
  site inside `modules/tradeFlow` is updated to match:
  `useSolanaTradeFlowContext.ts`, `buildSolanaTradeFlowContext.ts`,
  `useTradeFlowContext.ts` (swap's own EVM context), `solanaFlow/index.ts`,
  `swapFlow/index.ts`, `safeBundleFlow/{safeBundleEthFlow,safeBundleApprovalFlow}.ts`.
  `modules/limitOrders`'s own EVM `tradeFlow`/`safeBundleFlow` services build
  this analytics context as a same-named *local* variable, not through this
  shared interface — left untouched, out of scope.

`modules/tradeFlow/types/SolanaContextKey.ts`:

- `SolanaContextKey` tuple and `SolanaContextKeyParams` gain `orderClass` and
  `partiallyFillable` entries, threaded through unchanged otherwise.
  `SolanaTradeFlowContextParams` (consumed only by
  `getIsSolanaTradeFlowContextReady`) does **not** gain them — readiness never
  needs to gate on order classification, only on amounts/quote/signer being
  present.

## Fix the hardcoded `OrderClass.MARKET`

`modules/tradeFlow/services/solanaFlow/index.ts`, `buildSolanaOrder()`:
replace the literal `class: OrderClass.MARKET` with `class: context.orderClass`
(reading the new field off `SolanaTradeFlowContext.context`, destructured
alongside `chainId`/`validTo`/etc. at the top of `solanaFlow`).

## New file: `modules/limitOrders/hooks/useSolanaTradeFlowContext.ts`

Structurally mirrors `modules/tradeFlow/hooks/useSolanaTradeFlowContext.ts`,
importing the shared `buildSolanaContextKey`, `buildSolanaTradeFlowContext`,
`getIsSolanaTradeFlowContextReady`, and `useSolanaSigner` from
`modules/tradeFlow`. Differences from the swap version:

- Amounts, `orderKind`, `recipient`/`recipientAddress`, `inputCurrency` come
  from `useLimitOrdersDerivedState()` instead of `useDerivedTradeState()` +
  `useGetReceiveAmountInfo()`. `LimitOrdersDerivedState extends
  TradeDerivedState`, the same shape the swap-side builder already reads, so
  no shape translation is needed beyond picking the right source hook.
- `validTo` comes from `calculateLimitOrdersDeadline(settingsState,
  quoteState)` (reading `limitOrdersSettingsAtom`) instead of
  `getOrderValidTo(deadline, tradeQuoteState)`.
- Sets the two new context fields explicitly:
  `orderClass: OrderClass.LIMIT`, `partiallyFillable:
  settingsState.partialFillsEnabled`.
- `uiOrderType` is set directly to `UiOrderType.LIMIT` (matching how
  `modules/limitOrders/services/tradeFlow/index.ts` already hardcodes
  `orderType: UiOrderType.LIMIT` rather than deriving it), instead of
  `getUiOrderType(tradeTypeInfo?.tradeType)`.

## Quote-layer fixes

- `modules/tradeQuote/services/getSolanaQuote.service.ts`: destructure
  `partiallyFillable` from `quoteParams` (a `QuoteBridgeRequest`, which
  already carries it via `TradeOptionalParameters`) and pass it into
  `getSolanaQuoteFromSdk`'s `SolanaQuoteParameters`. Currently dropped for
  every Solana quote request, swap included — harmless there today since
  swap never sets it, but load-bearing once a limit request needs it.
- `modules/limitOrders/containers/LimitOrdersWidget/index.tsx:78`: change
  `useSetTradeQuoteParams({ amount: quoteAmount })` to
  `useSetTradeQuoteParams({ amount: quoteAmount, partiallyFillable:
  settingsState.partialFillsEnabled })`. `settingsState` is already read in
  this component. This is a pre-existing gap invisible for EVM (partial-fill
  is applied later, at order-post time via `postOrderParams.partiallyFillable`,
  not at quote time) but must be fixed for Solana, where the on-chain intent
  is fixed at quote time.

No change needed for `appData.metadata.orderClass` — already `'limit'` on the
whole LimitOrders page via the existing `AppDataUpdater orderClass="limit"`.

## Dispatcher & UI wiring

**Discovered mid-plan and confirmed with the user:** `LimitOrdersConfirmModal`
and `LimitOrdersDetails` (rendered inside it) are deeply coupled to the EVM
`TradeFlowContext` shape — they read `tradeContext.allowsOffchainSigning`,
`tradeContext.permitInfo`, `tradeContext.postOrderParams.{appData,
isSafeWallet, account, recipient, recipientAddressOrName, partiallyFillable}`,
`tradeContext.quoteState`, `tradeContext.chainId` directly, and
`LimitOrdersWidget` only renders the modal at all when that EVM context is
truthy (`confirmModal={tradeContext ? <LimitOrdersConfirmModal
tradeContext={tradeContext} .../> : null}`). Fixing only the dispatcher and
the `TradeButtons` gate (as originally scoped above) would leave the confirm
screen rendering nothing at all on Solana. The swap widget already solved this
exact problem: `SwapConfirmModal` never receives a typed trade context as a
prop — its props are chain-agnostic (`doTrade()` callback, `isTradeContextReady:
boolean`, currency previews, price impact, recipient), and it pulls anything
else it needs from chain-agnostic global hooks (`useWalletInfo()`,
`useAppData()`). All EVM-vs-Solana dispatch happens inside `useHandleSwap`,
which builds both `TradeFlowContext` and `SolanaTradeFlowContext` internally
and exposes only `{ callback, contextIsReady }`.

`limitOrders` follows the same pattern:

- `modules/limitOrders/hooks/useHandleOrderPlacement.ts`: drop `tradeContext`
  as a parameter. Build both `useTradeFlowContext()` (EVM) and the new
  `useSolanaTradeFlowContext()` (Solana) internally, exactly as
  `useHandleSwap`/`useTradeFlow` already do. Add a Solana branch — checked
  before the existing `shouldUseSafeBundle` branch (Solana has no Safe-wallet
  concept, same precedence swap's own dispatcher gives it) — that calls
  `solanaFlow` (imported from `modules/tradeFlow`) with the new hook's context
  and the `TradeFlowAnalytics` instance already obtained via
  `useTradeFlowAnalytics()`. Return `{ callback, isTradeContextReady,
  isSafeApprovalBundle }` instead of a bare callback — `isSafeApprovalBundle`
  (the EVM-only "bundled with approval" concept previously computed inside the
  confirm modal from `tradeContext`) moves into this hook, computed from the
  same inputs the hook already reads for its own `shouldUseSafeBundle` gate.
  `solanaFlow` already calls `tradeConfirmActions.onSuccess`/`.onError` and
  closes the modal itself (mirroring swap), unlike `tradeFlow`/`safeBundleFlow`
  (EVM) which return an order id string for the caller to finish handling —
  the hook's success branch only re-invokes `tradeConfirmActions.onSuccess`
  when the result is a string, to avoid a double call on the Solana path.
- `modules/limitOrders/containers/LimitOrdersConfirmModal/index.tsx` +
  `modules/limitOrders/pure/LimitOrdersDetails/index.tsx`: shrink both
  components' props to the chain-agnostic subset they actually need
  (`recipient`, `recipientAddressOrName`, `partiallyFillable`, `validTo`,
  `isSafeApprovalBundle`, currency previews, price impact, a `doTrade`
  callback, `isTradeContextReady`) instead of the raw `TradeFlowContext`.
  `account`/`chainId`/`appData` are read directly via `useWalletInfo()`/
  `useAppData()` inside the modal, matching `SwapConfirmModal`. Use
  `useFreezeWhileConfirming` (already used by `SwapConfirmModal`) in place of
  the modal's previous ad hoc `useMemo(() => tradeContextInitial, [])` freeze.
- `modules/limitOrders/containers/LimitOrdersWidget/index.tsx`: call the
  restructured `useHandleOrderPlacement()` (no `tradeContext` param) at the
  widget level (where `SwapWidget` calls `useHandleSwap`), instead of inside
  the confirm modal. Compute `recipient`/`recipientAddressOrName`/`validTo`
  directly from `useLimitOrdersDerivedState()` + `limitOrdersSettingsAtom` +
  `useTradeQuote()` — the same underlying state both the EVM and Solana
  context builders already derive these from — so the widget never needs to
  reach into either typed context for display purposes. Gate
  `confirmModal`/`TradeButtons` on the hook's `isTradeContextReady` (now true
  for either chain) instead of `!!tradeContext`.
- `modules/limitOrders/containers/TradeButtons/index.tsx`: remove the
  `skipTradeContextReadyGate` bypass entirely — `isDisabled` becomes
  `!warningsAccepted || !isTradeContextReady`, since `isTradeContextReady` now
  genuinely reflects Solana readiness.

## Testing

- Extend `modules/tradeFlow/services/solanaFlow/index.test.ts` to cover
  `orderClass` branching in `buildSolanaOrder()` (both `MARKET` and `LIMIT`).
- No new unit test for `modules/limitOrders/hooks/useSolanaTradeFlowContext.ts`
  itself — its swap equivalent (`modules/tradeFlow/hooks/useSolanaTradeFlowContext.ts`)
  has none either; it's a thin composition of already-tested lower-level
  pieces (`buildSolanaContextKey`, `buildSolanaTradeFlowContext`,
  `useSolanaSigner`) and is exercised indirectly through
  `useHandleOrderPlacement`'s tests and manual/e2e verification.
- Rewrite `modules/limitOrders/hooks/useHandleOrderPlacement.test.tsx` for the
  new `(priceImpact, settingsState, tradeConfirmActions) => { callback,
  isTradeContextReady, isSafeApprovalBundle }` signature (mocking
  `useTradeFlowContext`/`useSolanaTradeFlowContext` instead of passing a
  context object as an argument), and add cases for the Solana branch
  (dispatches to `solanaFlow`, not `tradeFlow`; does not double-call
  `tradeConfirmActions.onSuccess`).
- Add/extend a test on `getSolanaQuote.service.ts` verifying
  `partiallyFillable` is forwarded to the SDK call.

## Out of scope

- No changes to `@cowprotocol/sdk-trading-solana` (external SDK) — it already
  supports everything needed.
- No `FlowType` enum changes.
- No changes to `modules/limitOrders/services/tradeFlow` (EVM) or
  `modules/limitOrders/services/safeBundleFlow` (EVM).
- No changes to how `modules/tradeQuote`'s generic quote-fetching machinery
  (`fetchAndProcessQuote`, `usePollQuoteCallback`) dispatches between chains —
  already shared and chain-generic; only the two `partiallyFillable`
  passthrough gaps above need fixing.
