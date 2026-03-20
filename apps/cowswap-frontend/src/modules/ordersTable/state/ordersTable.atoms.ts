/* eslint-disable max-lines-per-function, complexity */

import { atom } from 'jotai'

import {
  BalancesAndAllowances,
  balancesAtom,
  tokenAllowancesLoadableFamily,
} from '@cowprotocol/balances-and-allowances'
import { jotaiStore } from '@cowprotocol/core'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom, isBundlingSupportedLoadableAtom } from '@cowprotocol/wallet'

import { observe } from 'jotai-effect'

import { OrderStatus, Order } from 'legacy/state/orders/actions'
import { ContractDeploymentBlocks } from 'legacy/state/orders/consts'

import { ordersTablePageAtom, ordersTableTabIdAtom } from 'modules/ordersTable/state/params/ordersTableParams.atom'
import { HistoryStatusFilter, getFilteredOrders } from 'modules/ordersTable/utils/getFilteredOrders'
import { getOrdersTableList } from 'modules/ordersTable/utils/getOrdersTableList'
import { buildOrdersTableUrl } from 'modules/ordersTable/utils/url/buildOrdersTableUrl'
import { emulatedPartOrdersAtom } from 'modules/twap/state/emulatedPartOrdersAtom'
import { emulatedTwapOrdersAtom } from 'modules/twap/state/emulatedTwapOrdersAtom'

import { hashHistory } from 'common/constants/routes'
import {
  TabOrderTypes,
  locationOrderTypeAtom,
  tabParamAtom,
  OrderTabId,
  locationAtom,
  pageParamAtom,
} from 'common/state/routesState'

import { ordersTableFiltersAtom } from './filters/ordersTableFilters.atom'
import { logOrdersTableDebug, setIsOrderUnfillable } from './odersTable.utils'
import { UI_ORDER_TYPE_BY_TAB_ORDER_TYPE, EMPTY_ORDERS_TABLE_STATE } from './ordersTable.constants'
import { OrdersTableState } from './ordersTable.types'
import { getTabsAndCurrentTab } from './params/ordersTableParams.atom'
import { pendingOrdersPermitValidityStateAtom } from './permit/pendingOrdersPermitValidity.atom'
import { reduxOrdersByOrderTypeAtom } from './redux/reduxOrders.atom'

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
  const unobserveReduxOrders = observe((get, set) => {
    const { chainId, account } = get(walletInfoAtom)

    if (!chainId || !account) {
      logOrdersTableDebug('No account or chainId, setting empty orders table state...')

      set(ordersTableStateAtom, EMPTY_ORDERS_TABLE_STATE)

      return
    }

    const orderType = get(locationOrderTypeAtom)
    const uiOrderType: UiOrderType = UI_ORDER_TYPE_BY_TAB_ORDER_TYPE[orderType]

    if (!orderType || !uiOrderType) {
      logOrdersTableDebug('Invalid order type', { orderType, uiOrderType })

      return
    }

    const reduxOrdersByOrderTypeResult = get(reduxOrdersByOrderTypeAtom)(uiOrderType)

    const { reduxOrdersStateInCurrentChain, ordersTokensSet } = reduxOrdersByOrderTypeResult

    // `reduxOrders` will include all orders of the right type based on `orderType` / `uiOrderType`. For TWAPS, we need
    // to add emulated twap orders, emulated part orders and discrete twap orders (this last one is directly derived
    // from `reduxOrders`):
    let { reduxOrders } = reduxOrdersByOrderTypeResult

    logOrdersTableDebug(`1. reduxOrdersStateInCurrentChain (${chainId}) =`, reduxOrdersStateInCurrentChain)

    if (!reduxOrdersStateInCurrentChain || !reduxOrders || !ordersTokensSet) {
      logOrdersTableDebug('Redux orders missing', { reduxOrdersStateInCurrentChain, reduxOrders, ordersTokensSet })

      return
    }

    if (orderType === TabOrderTypes.ADVANCED) {
      const isBundlingSupportedLoadable = get(isBundlingSupportedLoadableAtom)
      const isBundlingSupported =
        isBundlingSupportedLoadable.state === 'hasData' ? !!isBundlingSupportedLoadable.data : false

      if (!isBundlingSupported) {
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

    const balancesState = get(balancesAtom)
    const allowancesLoadable = get(
      tokenAllowancesLoadableFamily({
        chainId,
        account,
        tokenAddresses: Array.from(ordersTokensSet),
      }),
    )

    // TODO: This can probably be optimized, as we are loading allowances for all orders tokens regardless of order
    // type or status.

    const { isLoading: balancesLoading, values: balances } = balancesState
    const allowancesLoading = allowancesLoadable.state === 'loading'
    const allowances = allowancesLoadable.state === 'hasData' ? allowancesLoadable.data : undefined

    const balancesAndAllowances: BalancesAndAllowances = {
      isLoading: balancesLoading || allowancesLoading,
      balances,
      allowances,
    }

    const pendingOrdersPermitValidityState = get(pendingOrdersPermitValidityStateAtom)

    // All orders classified by tab (open, history, unfillable, signing):
    const ordersList = getOrdersTableList(
      reduxOrders,
      orderType,
      chainId,
      balancesAndAllowances,
      pendingOrdersPermitValidityState,
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
  }, jotaiStore)

  const unobserveURL = observe((get) => {
    const orderTypeParam = get(locationOrderTypeAtom)

    // Only in /limit and /advanced routes, we want to make sure we sync the tab and page params.
    if (orderTypeParam !== TabOrderTypes.LIMIT && orderTypeParam !== TabOrderTypes.ADVANCED) return

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
  }, jotaiStore)

  return () => {
    unobserveReduxOrders()
    unobserveURL()
  }
}
