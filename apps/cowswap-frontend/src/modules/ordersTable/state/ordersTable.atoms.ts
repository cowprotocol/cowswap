/* eslint-disable max-lines-per-function, complexity */

import { atom } from 'jotai'

import {
  BalancesAndAllowances,
  balancesAtom,
  tokenAllowancesLoadableFamily,
} from '@cowprotocol/balances-and-allowances'
import { jotaiStore } from '@cowprotocol/core'
import { areAddressesEqual, SupportedChainId, getAddressKey } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom, isBundlingSupportedLoadableAtom } from '@cowprotocol/wallet'

import { observe } from 'jotai-effect'

import { cowSwapStore } from 'legacy/state'
import {
  OrderStatus,
  Order,
  setIsOrderUnfillable as createSetIsOrderUnfillableAction,
  SetIsOrderUnfillableParams,
} from 'legacy/state/orders/actions'
import { ContractDeploymentBlocks } from 'legacy/state/orders/consts'
import { _concatOrdersState } from 'legacy/state/orders/hooks'
import { ORDER_LIST_KEYS, OrdersState, OrdersStateNetwork, getDefaultNetworkState } from 'legacy/state/orders/reducer'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'
import { atomFromReduxSelector } from 'legacy/utils/atomFromReduxSelector'

import { ordersTablePageAtom, ordersTableTabIdAtom } from 'modules/ordersTable/state/tabs/ordersTableTabs.atom'
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
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrdersTableState, OrdersTableList } from './ordersTable.types'
import { ordersTableFiltersAtom } from './ordersTableFilters.atom'
import { pendingOrdersPermitValidityStateAtom } from './permit/pendingOrdersPermitValidity.atom'
import { getTabsAndCurrentTab } from './tabs/ordersTableTabs.atom'

const EMPTY_ORDERS_LIST = {
  [OrderTabId.OPEN]: [],
  [OrderTabId.HISTORY]: [],
  [OrderTabId.UNFILLABLE]: [],
  [OrderTabId.SIGNING]: [],
} as const satisfies OrdersTableList

const EMPTY_ORDERS_TABLE_STATE = {
  reduxOrders: [],
  pendingOrders: [],
  orders: [],
  ordersList: EMPTY_ORDERS_LIST,
  filteredOrders: [],
  hasHydratedOrders: false,
  balancesAndAllowances: {
    isLoading: false,
    balances: {},
    allowances: {},
  },
} as const satisfies OrdersTableState

export const ordersTableStateAtom = atom<OrdersTableState>(EMPTY_ORDERS_TABLE_STATE)

const reduxOrdersStateAtom = atomFromReduxSelector<OrdersState>((appState) => appState.orders)

const reduxOrdersStateByChainAtom = atom((get) => (chainId: SupportedChainId) => {
  if (!chainId) return {} as OrdersStateNetwork

  const reduxOrdersStateByChain = get(reduxOrdersStateAtom)?.[chainId] || {}

  return { ...getDefaultNetworkState(chainId), ...reduxOrdersStateByChain }
})

function setIsOrderUnfillable(params: SetIsOrderUnfillableParams): void {
  cowSwapStore.dispatch(createSetIsOrderUnfillableAction(params))
}

ordersTableStateAtom.onMount = () => {
  const unobserveReduxOrders = observe((get, set) => {
    const { chainId, account } = get(walletInfoAtom)

    if (!account || !chainId) {
      console.warn('No account or chainId, setting empty orders table state...')

      set(ordersTableStateAtom, EMPTY_ORDERS_TABLE_STATE)
      return
    }

    const selectReduxOrdersStateByChain = get(reduxOrdersStateByChainAtom)
    const reduxOrdersStateInCurrentChain = selectReduxOrdersStateByChain(chainId)

    console.log('1. reduxOrdersStateInCurrentChain =', reduxOrdersStateInCurrentChain)

    let reduxOrders: Order[] = []

    const ordersTokensSet = new Set<string>()

    if (reduxOrdersStateInCurrentChain && account) {
      const orderType = get(locationOrderTypeAtom)

      const uiOrderType: UiOrderType = {
        // This mapping is intentional.
        // The swap page and `AffectedPermitOrdersTable` component check open limit orders with partial approvals.
        [TabOrderTypes.SWAP]: UiOrderType.LIMIT,
        [TabOrderTypes.LIMIT]: UiOrderType.LIMIT,
        [TabOrderTypes.ADVANCED]: UiOrderType.TWAP,
        [TabOrderTypes.YIELD]: UiOrderType.LIMIT,
      }[orderType]

      if (!orderType || !uiOrderType) {
        console.warn('Invalid order type', { orderType, uiOrderType })
      }

      /*
      const ordersTokens = useMemo(() => getOrdersInputTokens(allOrders), [allOrders])
      const balancesAndAllowances = useBalancesAndAllowances(ordersTokens)
      const orderActions = useOrderActions(allOrders)

      const ordersList = useOrdersTableList(allOrders, orderType, chainId, balancesAndAllowances)

      const { currentTabId, currentPageNumber } = useCurrentTab(ordersList)

      const orders = ordersList[currentTabId]
      const filteredOrders = useFilteredOrders(orders, {
        searchTerm,
        // The status filter select is only visible in the story tab:
        historyStatusFilter: currentTabId === OrderTabId.HISTORY ? historyStatusFilter : HistoryStatusFilter.ALL,
      })
      const hasHydratedOrders = useOrdersHydrationState({ chainId, orders: allOrders })
      const tabs = useTabs(ordersList, currentTabId)
      */

      // TODO: Can this be optimized instead of looping through orders various times?

      // TODO: Also extract pending in the same loop.

      // TODO: TWAPs need additional processing, do it in the same loop.

      // TODO: Maybe instead of using _concatOrdersState we can process only the ones we need (mapping ordersTableFilters.orderType to OrderTypeKeys)

      _concatOrdersState(reduxOrdersStateInCurrentChain, ORDER_LIST_KEYS).forEach((order) => {
        if (!order) return

        const doesBelongToAccount = areAddressesEqual(order.order.owner, account)
        const orderUiOrderType = getUiOrderType(order.order)
        const doesMatchClass = orderUiOrderType === uiOrderType

        if (!doesBelongToAccount || !doesMatchClass) return

        const mappedOrder = deserializeOrder(order)

        if (!mappedOrder || mappedOrder.isHidden) return

        reduxOrders.push(mappedOrder)
        ordersTokensSet.add(getAddressKey(mappedOrder.inputToken.address))
      })

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

      const pendingOrders: Order[] = reduxOrders.filter((order) => order.status === OrderStatus.PENDING)

      // TODO: This can probably be optimized, as we are loading allowances for all orders tokens regardless of order
      // type or status.
      const ordersTokensAddresses = Array.from(ordersTokensSet)

      console.log('2. reduxOrders =', reduxOrders)

      const balancesState = get(balancesAtom)
      const allowancesLoadable = get(
        tokenAllowancesLoadableFamily({
          chainId,
          account,
          tokenAddresses: ordersTokensAddresses,
        }),
      )
      const pendingOrdersPermitValidityState = get(pendingOrdersPermitValidityStateAtom)

      const { isLoading: balancesLoading, values: balances } = balancesState
      const allowancesLoading = allowancesLoadable.state === 'loading'
      const allowances = allowancesLoadable.state === 'hasData' ? allowancesLoadable.data : undefined

      const balancesAndAllowances: BalancesAndAllowances = {
        isLoading: balancesLoading || allowancesLoading,
        balances,
        allowances,
      }

      // All orders of orderType:

      const ordersList = getOrdersTableList(
        reduxOrders,
        orderType,
        chainId,
        balancesAndAllowances,
        pendingOrdersPermitValidityState,
        setIsOrderUnfillable,
      )

      console.log('3. ordersList =', ordersList)

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

      console.log(`4. orders (${tabId}) =`, orders)

      const { searchTerm, historyStatusFilter } = get(ordersTableFiltersAtom)

      const filteredOrders = getFilteredOrders(orders, {
        searchTerm,
        // The status filter select is only visible in the story tab:
        historyStatusFilter: tabId === OrderTabId.HISTORY ? historyStatusFilter : HistoryStatusFilter.ALL,
      })

      console.log(`5. filteredOrders (${tabId}) =`, filteredOrders)

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

// TODO: Maybe create separate limitOrdersTable, twapOrdersTable and reduxOrders atom with onMount
