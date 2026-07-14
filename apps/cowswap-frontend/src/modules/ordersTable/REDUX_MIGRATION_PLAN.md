# Orders State Redux to Jotai Migration

## Context

`ordersTable` is already using Jotai for its UI-facing state, but the source-of-truth for orders is still Redux:

- Redux persists `appState.orders` through `redux-localstorage-simple`.
- `reduxOrdersStateAtom` bridges `appState.orders` into Jotai with `atomFromReduxSelector`.
- `ordersTableStateAtom` projects that bridged state into the table model: route-specific orders, pending orders, tab buckets, filters, balances, allowances, and URL corrections.

The migration goal is to replace the Redux source:

```ts
appState.orders -> reduxOrdersStateAtom
```

with a Jotai-owned source:

```ts
ordersStateAtom -> ordersTableStateAtom
```

`ordersTableStateAtom` should remain the UI projection layer, specific to the orders table needs. It should not become the persistence layer or the place where order reducer semantics are reimplemented.

## Target Shape

Create an owning Jotai state module for orders, separate from the orders table projection:

- `ordersStateAtom`: canonical persisted orders state.
- Order write atoms/actions that replace the current Redux actions such as `addPendingOrder`, `addOrUpdateOrders`, `updateOrder`, `cancelOrdersBatch`, `setIsOrderUnfillable`, and `updateLastCheckedBlock`.
- Read-only selectors for common order views: current-chain state, orders by UI order type, pending orders, cancelled orders, expired orders, and order by id.
- A persistence migration that reads the existing Redux `orders` storage once and writes the new Jotai storage key.

The initial `ordersStateAtom` value should keep the existing `OrdersState` / `OrdersStateNetwork` shape unless there is a separate, well-tested reason to normalize it. Keeping the shape stable makes it possible to replace the source atom without rewriting the table projection and all order updaters at the same time.

## Migration Plan

1. Add `ordersStateAtom` behind the current bridge.

   Start by introducing a Jotai atom that mirrors `appState.orders` and uses the same `OrdersState` type. During this phase, `reduxOrdersStateAtom` can continue to be the public source for `ordersTable`, but tests should be added around the new atom's selectors and write atoms.

2. Extract reducer semantics into pure helpers.

   Move the state-transition logic from the Redux reducer into pure functions that accept the current `OrdersState` and return the next state. Redux and Jotai can temporarily call the same helpers, which avoids behavior drift while the app still has both stores.

3. Move writes from Redux dispatches to Jotai write atoms.

   Replace module by module, starting with the orders table local write:

   - `setIsOrderUnfillable` currently dispatches the Redux `setIsOrderUnfillable` action from `ordersTable.utils.ts`.
   - Convert it to a Jotai write atom so `getOrdersTableList` can update `ordersStateAtom` without going through Redux.
   - Continue replacing the legacy order hooks and updaters with equivalent write atoms until no order writes depend on `cowSwapStore.dispatch`.

4. Switch `ordersTable` reads to `ordersStateAtom`.

   Once writes are Jotai-owned, replace `reduxOrdersStateAtom` imports in `ordersTable` with selectors derived from `ordersStateAtom`:

   - `ordersTableStateAtom`
   - `swapOrdersAtom`
   - `onlyPendingOrdersAtom`

   The existing helpers `getReduxOrdersStateByChain` and `getReduxOrdersByOrderTypeFromNetworkState` can be renamed after the source is no longer Redux-specific.

5. Migrate persistence and remove Redux storage.

   Add a defensive persisted-state migration for the old Redux `orders` key. The migration must tolerate malformed data and should preserve `lastCheckedBlock` defaults per chain. After the migration has shipped long enough, remove `orders` from Redux `PERSISTED_KEYS` and delete the Redux reducer/actions/hooks that are no longer used.

   This could be a good opportunity to rethink this persistence layer and consider eviction strategies for orders that we no longer need to store. Also, we could implement this with IndexedDb instead of `localStorage`, given its size.

## Important Constraints

- Keep `ordersTableStateAtom` as the table projection, not the canonical order store.
- Preserve the current route synchronization behavior in `ordersTableStateAtom.onMount`; moving URL writes into a derived atom can reintroduce stale reads or Jotai mutation-during-read errors.
- Do not change persisted data shape and state ownership in the same step unless the migration has dedicated tests.
- Keep address handling through `areAddressesEqual` and `getAddressKey`; do not compare or normalize addresses manually.
- Keep TWAP composition behavior intact: advanced orders currently combine emulated TWAP orders, emulated part orders, and discrete TWAP orders derived from stored orders.

## Verification Checklist

- Unit test the extracted order state-transition helpers against the current reducer behavior.
- Run the existing orders table tests after each source swap:
  - `ordersTable.atoms.test.ts`
  - `getOrdersTableList.test.ts`
  - `reduxOrders.utils.test.ts` or its renamed equivalent
- Add persistence migration tests with current, missing, and malformed old Redux orders storage.
- Manually verify limit, swap, and advanced orders for:
  - pending/open/history/signing/unfillable tabs
  - URL tab/page correction
  - TWAP parent and part order display
  - unfillable flag updates
