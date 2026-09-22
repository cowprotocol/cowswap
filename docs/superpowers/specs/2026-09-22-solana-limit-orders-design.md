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

- `SolanaContextKey` tuple, `SolanaContextKeyParams`, and
  `SolanaTradeFlowContextParams` all gain `orderClass` and `partiallyFillable`
  entries, threaded through unchanged otherwise.

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

`modules/limitOrders/hooks/useHandleOrderPlacement.ts`: add a Solana branch,
checked before the existing `shouldUseSafeBundle` branch (Solana has no
Safe-wallet concept, same precedence swap's own dispatcher gives it in
`getFlowType`). Calls `solanaFlow` (imported from `modules/tradeFlow`) with
the new hook's context and the `TradeFlowAnalytics` instance already obtained
via `useTradeFlowAnalytics()` for the existing EVM branches — no new analytics
plumbing needed, since `TradeFlowAnalytics`'s methods already take a generic
`TradeFlowAnalyticsContext`.

`modules/limitOrders/containers/LimitOrdersWidget/index.tsx` +
`modules/limitOrders/containers/TradeButtons/index.tsx`: remove the
`skipTradeContextReadyGate` bypass. `isTradeContextReady` becomes
`isSolanaChain(chainId) ? !!solanaContext : !!tradeContext`, so the confirm
button is gated on real Solana context readiness instead of unconditionally
enabled.

## Testing

- Extend `modules/tradeFlow/services/solanaFlow/index.test.ts` to cover
  `orderClass` branching in `buildSolanaOrder()` (both `MARKET` and `LIMIT`).
- Add a test for the new `modules/limitOrders/hooks/useSolanaTradeFlowContext.ts`
  hook, mirroring the existing test patterns for
  `modules/limitOrders/hooks/useTradeFlowContext.ts` /
  `modules/tradeFlow/hooks/useSolanaTradeFlowContext.ts` (readiness gating,
  key memoization).
- Extend `modules/limitOrders/hooks/useHandleOrderPlacement.test.tsx` for the
  new Solana branch (dispatches to `solanaFlow`, not `tradeFlow`, on a Solana
  chain).
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
