/* eslint-disable max-lines-per-function, complexity */

import { atom, type Getter, type Setter } from 'jotai'

import {
  BalancesAndAllowances,
  balancesAtom,
  tokenAllowancesFamily,
  tradeSpenderAtom,
  AllowancesState,
  type BalancesState,
} from '@cowprotocol/balances-and-allowances'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom, isAtomicBatchSupportedLoadableAtom } from '@cowprotocol/wallet'

import { getOptimisticAllowanceKey } from 'entities/optimisticAllowance/getOptimisticAllowanceKey'
import { optimisticAllowancesAtom } from 'entities/optimisticAllowance/optimisticAllowancesAtom'
import {
  TabOrderTypes,
  locationOrderTypeAtom,
  tabParamAtom,
  OrderTabId,
  locationAtom,
  pageParamAtom,
} from 'entities/routes/routes.atom'
import { observe } from 'jotai-effect'

import { OrderStatus, Order } from 'legacy/state/orders/actions'
import { ContractDeploymentBlocks } from 'legacy/state/orders/consts'

import { ordersTableOrderTypeAtom } from 'modules/ordersTable/state/ordersTableOrderType.atom'
import { ordersTablePageAtom, ordersTableTabIdAtom } from 'modules/ordersTable/state/params/ordersTableParams.atom'
import { HistoryStatusFilter, getFilteredOrders } from 'modules/ordersTable/utils/getFilteredOrders'
import { getOrdersTableList } from 'modules/ordersTable/utils/getOrdersTableList'
import { buildOrdersTableUrl } from 'modules/ordersTable/utils/url/buildOrdersTableUrl'
import { emulatedPartOrdersAtom } from 'modules/twap/state/emulatedPartOrdersAtom'
import { emulatedTwapOrdersAtom } from 'modules/twap/state/emulatedTwapOrdersAtom'

import { hashHistory } from 'common/constants/routes'

import { ordersTableFiltersAtom } from './filters/ordersTableFilters.atom'
import { UI_ORDER_TYPE_BY_TAB_ORDER_TYPE, EMPTY_ORDERS_TABLE_STATE } from './ordersTable.constants'
import { OrdersTableState } from './ordersTable.types'
import { logOrdersTableDebug, setIsOrderUnfillable } from './ordersTable.utils'
import { getTabsAndCurrentTab } from './params/ordersTableParams.atom'
import { pendingOrdersPermitValidityStateAtom } from './permit/pendingOrdersPermitValidity.atom'
import { reduxOrdersStateAtom } from './redux/reduxOrders.atom'
import { getReduxOrdersByOrderTypeFromNetworkState, getReduxOrdersStateByChain } from './redux/reduxOrders.utils'

import type { OptimisticAllowance } from 'entities/optimisticAllowance/types'

/**
 * WARNING: It looks like this could be a derived atom, but it cannot!
 *
 * If we do that, the routing logic must be moved somewhere else, most likely to
 * `reduxOrdersAtom.onMount`. In that case, the routing logic will trigger
 * before the `ordersTableStateAtom` is updated, and tab/page atoms can still
 * see the old value while `locationAtom` has already changed while, or
 * `hashHistory.replace` might still be running during the same Jotai flush,
 * leading to the tabs UI rendering based on stale data OR "Detected store
 * mutation during atom read" errors, depending how you structure the code.
 */
export const ordersTableStateAtom = atom<OrdersTableState>(EMPTY_ORDERS_TABLE_STATE)

ordersTableStateAtom.onMount = () => {
  const unobserveReduxOrders = observe(observeReduxOrders, jotaiStore)
  const unobserveURL = observe(observeOrdersUrl, jotaiStore)

  return () => {
    unobserveReduxOrders()
    unobserveURL()
  }
}

/**
 * Builds the balances and allowances snapshot used to classify pending orders, applying optimistic allowance updates
 * over the loaded allowance state while preserving loading state from both sources.
 *
 * Note that the logic to apply the optimistic allowances is temporary until the allowancesAtom takes over that logic internally.
 */
export function getBalancesAndAllowances(
  balancesState: BalancesState,
  allowancesState: AllowancesState | null,
  optimisticAllowances: Record<string, OptimisticAllowance>,
  chainId: number,
  account: string,
  spender: string,
): BalancesAndAllowances {
  // TODO: Merge optimistic allowances here manually until allowancesAtom / allowances module consolidates
  // all allowance-related logic:

  let allowances: AllowancesState = {}

  if (allowancesState) {
    allowances = Object.entries(allowancesState).reduce((acc, [tokenAddress, allowanceAmount]) => {
      const optimisticAllowanceKey =
        !tokenAddress || !account || !spender
          ? ''
          : getOptimisticAllowanceKey({ chainId, tokenAddress, owner: account, spender })

      acc[tokenAddress] = optimisticAllowances[optimisticAllowanceKey]?.amount ?? allowanceAmount

      return acc
    }, {} as AllowancesState)
  }

  // TODO: This can probably be optimized, as we are loading allowances for all orders tokens regardless of order
  // type or status.

  const { isLoading: balancesLoading, values: balances } = balancesState
  const allowancesLoading = allowancesState === null

  return {
    isLoading: balancesLoading || allowancesLoading,
    balances,
    allowances,
  }
}

/**
 * Recomputes the orders table state whenever wallet, order, balance, allowance, permit, or filter atoms change.
 * Registered with `jotai-effect` from `ordersTableStateAtom.onMount` to keep routing and table state in one flush.
 */
export function observeReduxOrders(get: Getter, set: Setter): void {
  const { connector, chainId, account } = get(walletInfoAtom)

  if (!connector || !chainId || !account) {
    logOrdersTableDebug('No connector, account or chainId, setting empty orders table state...')

    set(ordersTableStateAtom, EMPTY_ORDERS_TABLE_STATE)

    return
  }

  const orderType = get(ordersTableOrderTypeAtom)

  if (!orderType) {
    logOrdersTableDebug('No orders table order type set, setting empty orders table state...')

    set(ordersTableStateAtom, EMPTY_ORDERS_TABLE_STATE)

    return
  }

  const uiOrderType: UiOrderType = UI_ORDER_TYPE_BY_TAB_ORDER_TYPE[orderType]

  if (!uiOrderType) {
    throw new Error(`Invalid orderType = ${orderType} or uiOrderType = ${uiOrderType}`)
  }

  const reduxOrdersStateInCurrentChain = getReduxOrdersStateByChain(get(reduxOrdersStateAtom), chainId)
  const reduxOrdersByOrderTypeResult = getReduxOrdersByOrderTypeFromNetworkState({
    account,
    reduxOrdersStateInCurrentChain,
    uiOrderType,
  })

  const { ordersTokensSet } = reduxOrdersByOrderTypeResult

  // `reduxOrders` will include all orders of the right type based on `orderType` / `uiOrderType`. For TWAPS, we need
  // to add emulated twap orders, emulated part orders and discrete twap orders (this last one is directly derived
  // from `reduxOrders`):
  let { reduxOrders } = reduxOrdersByOrderTypeResult

  logOrdersTableDebug(`1. reduxOrdersStateInCurrentChain (${chainId}) =`, reduxOrdersStateInCurrentChain)

  if (!reduxOrdersStateInCurrentChain || !reduxOrders || !ordersTokensSet) {
    throw new Error('Redux orders missing')
  }

  if (orderType === TabOrderTypes.ADVANCED) {
    const isAtomicBatchSupportedLoadable = get(isAtomicBatchSupportedLoadableAtom)
    const isAtomicBatchSupported =
      isAtomicBatchSupportedLoadable.state === 'hasData' ? !!isAtomicBatchSupportedLoadable.data : false

    if (!isAtomicBatchSupported) {
      reduxOrders = []
    } else {
      const emulatedTwapOrders = get(emulatedTwapOrdersAtom)
      const emulatedPartOrders = get(emulatedPartOrdersAtom)
      const discreteTwapOrders = reduxOrders.filter((order) => order.composableCowInfo?.isVirtualPart === false)

      reduxOrders = emulatedTwapOrders.concat(emulatedPartOrders).concat(discreteTwapOrders)
    }
  }

  logOrdersTableDebug(`2. reduxOrders (${orderType} / ${uiOrderType}) =`, reduxOrders)

  // All pending orders of the right type based on `orderType` / `uiOrderType`:
  const pendingOrders: Order[] = reduxOrders.filter((order) => order.status === OrderStatus.PENDING)

  logOrdersTableDebug('3. pendingOrders =', pendingOrders)

  // `tradeSpenderAtom` is an override-only atom, so it will usually be `undefined`.
  // Therefore, we must fallback to the chain vault relayer spender:
  const spenderOverride = get(tradeSpenderAtom)
  const spender = spenderOverride ?? COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

  const balancesState = get(balancesAtom)
  const allowancesState = get(
    tokenAllowancesFamily({
      connector,
      chainId,
      account,
      spender,
      tokenAddresses: Array.from(ordersTokensSet),
    }),
  )
  const optimisticAllowances = get(optimisticAllowancesAtom)
  const balancesAndAllowances = getBalancesAndAllowances(
    balancesState,
    allowancesState,
    optimisticAllowances,
    chainId,
    account,
    spender,
  )

  const pendingOrdersPermitValidityState = get(pendingOrdersPermitValidityStateAtom)

  // All orders classified by tab (open, history, unfillable, signing):
  const ordersList = getOrdersTableList(
    reduxOrders,
    orderType,
    chainId,
    balancesAndAllowances,
    pendingOrdersPermitValidityState,

    // TODO: We should not have side-effects during reads. This should eventually be removed...
    setIsOrderUnfillable,
  )

  logOrdersTableDebug('4. ordersList =', ordersList)

  // hasHydratedOrders:

  const { lastCheckedBlock } = reduxOrdersStateInCurrentChain
  const defaultBlock = ContractDeploymentBlocks[chainId] ?? 0
  const hasHydratedOrders =
    reduxOrders.length > 0 || (typeof lastCheckedBlock === 'number' && lastCheckedBlock !== defaultBlock)

  // current tab(s):

  // Note we don't use the URL param directly (`tabParam`), but the verified/corrected `tabId`. This means we show
  // the orders for the right tab even if the URL param is incorrect. The redirect will happen shortly.
  const tabParam = get(tabParamAtom)
  const { tabId } = getTabsAndCurrentTab({ hasHydratedOrders, ordersList, tabParam })
  const orders = tabId ? ordersList[tabId] : []

  logOrdersTableDebug(`5. orders = ordersList[${tabId}] =`, orders)

  const { searchTerm, historyStatusFilter } = get(ordersTableFiltersAtom)

  // `orders` after applying search and history status filter:
  const filteredOrders = getFilteredOrders(orders, {
    searchTerm,
    // The status filter applied only if we are in the story tab:
    historyStatusFilter: tabId === OrderTabId.HISTORY ? historyStatusFilter : HistoryStatusFilter.ALL,
  })

  logOrdersTableDebug(`6. filteredOrders =  ordersList[${tabId}].filter(...) =`, filteredOrders)

  set(ordersTableStateAtom, {
    reduxOrders,
    pendingOrders,
    ordersList,
    orders,
    filteredOrders,
    balancesAndAllowances,
    hasHydratedOrders,
  })
}

/**
 * Keeps the orders table URL tab and page params aligned with the validated table state for limit and advanced orders.
 * The URL params are treated as user intent; derived table atoms remain the source of truth.
 */
export function observeOrdersUrl(get: Getter): void {
  const orderTypeParam = get(locationOrderTypeAtom)
  const orderType = get(ordersTableOrderTypeAtom)

  // Only in /limit and /advanced routes, once the URL and `ordersTableOrderTypeAtom` values match, we want to make sure we sync the tab and page params.
  if (orderTypeParam !== orderType || (orderType !== TabOrderTypes.LIMIT && orderType !== TabOrderTypes.ADVANCED))
    return

  // These are the values in the URL params, and the user controls them, so they might be incorrect.
  // They state an intention, but are not a source of truth.
  const tabParam = get(tabParamAtom)
  const pageParam = get(pageParamAtom)

  // These ones, on the other hand, take into consideration the value of the params in the URL, plus the current
  // app state. If they do not match, we redirect the user to the right place. Some examples:
  // - Page just loaded, no params in the URL yet. Depending on the orders loaded, the default state will be OPEN or HISTORY.
  // - URL tab param = signing but there are no signing orders
  const expectedTab = get(ordersTableTabIdAtom)
  const expectedPage = get(ordersTablePageAtom)

  if (!expectedTab || !expectedPage || (tabParam === expectedTab && pageParam === expectedPage)) return

  const location = get(locationAtom)

  const redirectTo = buildOrdersTableUrl(location, {
    tabId: expectedTab,
    pageNumber: expectedPage,
  })

  hashHistory.replace(redirectTo)
}
