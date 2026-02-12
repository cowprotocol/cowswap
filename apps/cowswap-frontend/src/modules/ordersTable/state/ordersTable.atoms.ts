import { atom } from 'jotai'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { balancesAtom } from '@cowprotocol/balances-and-allowances'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { createHashHistory, Location } from 'history'

import { observe } from 'jotai-effect'

import { cowSwapStore } from 'legacy/state'
import { Order } from 'legacy/state/orders/actions'
import {
  setIsOrderUnfillable as createSetIsOrderUnfillableAction,
  SetIsOrderUnfillableParams,
} from 'legacy/state/orders/actions'
import { _concatOrdersState } from 'legacy/state/orders/hooks'
import { ORDER_LIST_KEYS, OrdersState, OrdersStateNetwork } from 'legacy/state/orders/reducer'
import { getDefaultNetworkState } from 'legacy/state/orders/reducer'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'
import { atomFromReduxSelector } from 'legacy/utils/atomFromReduxSelector'

import { HistoryStatusFilter, getFilteredOrders } from 'modules/ordersTable/hooks/useFilteredOrders'
import { getOrdersTableList } from 'modules/ordersTable/hooks/useOrdersTableList'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrdersTableState, OrdersTableFilters, TabOrderTypes, OrdersTableList } from './ordersTable.types'
import { pendingOrdersPermitValidityStateAtom } from './permit/pendingOrdersPermitValidity.atom'
import { ORDERS_TABLE_TABS, OrderTabId } from './tabs/ordersTableTabs.constants'

export const ordersTableStateAtom = atom<OrdersTableState>({
  reduxOrders: [],
  orders: [],
  ordersList: {
    open: [],
    history: [],
    unfillable: [],
    signing: [],
  },
  filteredOrders: [],
  hasHydratedOrders: false,
  balancesAndAllowances: {
    isLoading: false,
    balances: {},
    allowances: {},
  },
})

export const DEFAULT_ORDERS_TABLE_FILTERS = {
  orderType: TabOrderTypes.LIMIT,
  // currentPageNumber: 1, // TODO: Init from URL...
  // tabs: [],
  // currentTabId: OrderTabId.open, // TODO: Init from URL...
  searchTerm: '',
  historyStatusFilter: HistoryStatusFilter.FILLED,
  displayOrdersOnlyForSafeApp: false,
} as const satisfies OrdersTableFilters

export const ordersTableFiltersAtom = atom<OrdersTableFilters>(DEFAULT_ORDERS_TABLE_FILTERS)

export const ordersTableTabsAtom = atom((get) => {
  console.log('ordersTableTabAtom atom')

  const { account } = get(walletInfoAtom)
  // const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkUnsupported = false

  if (!account || isProviderNetworkUnsupported) {
    return []
  }

  const { ordersList } = get(ordersTableStateAtom)
  const ordersTableURLParams = get(ordersTableURLParamsAtom)
  const currentTabId = ordersTableURLParams.tab || OrderTabId.open;

  return ORDERS_TABLE_TABS.filter((tab) => {
    // Always show OPEN and HISTORY tabs
    if (tab.id === OrderTabId.open || tab.id === OrderTabId.history) {
      return true
    }

    // Only include the unfillable tab if there are unfillable orders
    if (tab.id === OrderTabId.unfillable) {
      return ordersList[tab.id].length > 0
    }

    // Only include the signing tab if there are signing orders
    if (tab.id === OrderTabId.signing) {
      return ordersList[tab.id].length > 0
    }

    return false
  }).map((tab) => {
    return { ...tab, isActive: tab.id === currentTabId, count: ordersList[tab.id].length }
  })
})

const reduxOrdersStateAtom = atomFromReduxSelector<OrdersState>((appState) => appState.orders)

const reduxOrdersStateByChainAtom = atom((get) => (chainId: SupportedChainId) => {
  if (!chainId) return {} as OrdersStateNetwork

  const reduxOrdersStateByChain = get(reduxOrdersStateAtom)?.[chainId] || {}

  return { ...getDefaultNetworkState(chainId), ...reduxOrdersStateByChain }
})

export const { updateAtom: partiallyUpdateOrdersTableFiltersAtom } = atomWithPartialUpdate(ordersTableFiltersAtom)

export const hashHistory = createHashHistory();

hashHistory.listen((event) => {
  console.log("location", event)
})


export const locationAtom = atom<Location>({
  key: '',
  pathname: '',
  search: '',
  hash: '',
  state: undefined,
})

locationAtom.onMount = (setAtom) => {
  hashHistory.listen((event) => {
    setAtom(event.location)
  })
}

export const locationPathnameAtom = atom((get) => get(locationAtom).pathname)
export const locationSearchAtom = atom((get) => get(locationAtom).search)
export const locationSearchParamsAtom = atom((get) => new URLSearchParams(get(locationSearchAtom)))

export const ordersTableURLParamsAtom = atom((get) => {
  const locationSearchParams = get(locationSearchParamsAtom)

  console.log("ordersTableURLParamsAtom", {
    tab: locationSearchParams.get("tab") as OrderTabId | undefined,
    page: parseInt(locationSearchParams.get("page") || "") || undefined,
  });

  return {
    tab: locationSearchParams.get("tab") as OrderTabId | undefined,
    page: parseInt(locationSearchParams.get("page") || "") || undefined,
  }
})

/*
ordersTableFiltersAtom.onMount = () => {
  console.log("ordersTableFiltersAtom MOUNT");

  return observe((get, set) => {
    const { tab, page } = get(ordersTableURLParamsAtom)

    console.log("ordersTabId =", tab, "ordersPage =", page);

    set(partiallyUpdateOrdersTableFiltersAtom as any, {
      currentTabId: tab,
      currentPageNumber: page,
    } as Partial<OrdersTableFilters>)
  })
}
*/

ordersTableStateAtom.onMount = () => {
  const unobserve = observe((get, set) => {
    console.log('observe')

    const { chainId, account } = get(walletInfoAtom)
    const ordersTableFilters = get(ordersTableFiltersAtom)
    const selectReduxOrdersStateByChain = get(reduxOrdersStateByChainAtom)
    const reduxOrdersStateInCurrentChain = selectReduxOrdersStateByChain(chainId)

    console.log('New data: ', {
      chainId,
      account,
      ordersTableFilters,
      reduxOrdersStateInCurrentChain,
      test: get(locationSearchParamsAtom),
    })

    const reduxOrders: Order[] = []
    const ordersTokensSet = new Set<string>()

    if (reduxOrdersStateInCurrentChain && account) {
      const accountLowerCase = account.toLowerCase()

      const uiOrderType: UiOrderType = {
        [TabOrderTypes.LIMIT]: UiOrderType.LIMIT,
        [TabOrderTypes.ADVANCED]: UiOrderType.TWAP,
      }[ordersTableFilters.orderType]

      // TODO: In the same loop, generate all this:

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
        historyStatusFilter: currentTabId === OrderTabId.history ? historyStatusFilter : HistoryStatusFilter.ALL,
      })
      const hasHydratedOrders = useOrdersHydrationState({ chainId, orders: allOrders })
      const tabs = useTabs(ordersList, currentTabId)
      */

      // TODO: Also extract pending in the same loop.

      // TODO: TWAPs need additional processing, do it in the same loop.

      // TODO: Maybe instead of using _concatOrdersState we can process only the ones we need (mapping rdersTableFilters.orderType to OrderTypeKeys)
      _concatOrdersState(reduxOrdersStateInCurrentChain, ORDER_LIST_KEYS).forEach((order) => {
        if (!order) return

        const doesBelongToAccount = order.order.owner.toLowerCase() === accountLowerCase
        const orderType = getUiOrderType(order.order)
        const doesMatchClass = orderType === uiOrderType

        if (!doesBelongToAccount || !doesMatchClass) return

        const mappedOrder = deserializeOrder(order)

        if (!mappedOrder || mappedOrder.isHidden) return

        reduxOrders.push(mappedOrder)
        ordersTokensSet.add(mappedOrder.inputToken.address.toLowerCase())
      })

      const ordersTokens = Array.from(ordersTokensSet)

      const balancesState = get(balancesAtom)
      // const allowancesState = get(allowancesAtom) // TODO: Needs ordersTokens to get allowances...
      const pendingOrdersPermitValidityState = get(pendingOrdersPermitValidityStateAtom)

      const { isLoading: balancesLoading, values: balances } = balancesState
      // const { isLoading: allowancesLoading, state: allowances } = allowancesState

      const balancesAndAllowances: BalancesAndAllowances = {
        isLoading: balancesLoading /* || allowancesLoading*/,
        balances,
        allowances: {},
      }

      // All orders of orderType:

      let ordersList: OrdersTableList = {
        open: [],
        history: [],
        unfillable: [],
        signing: [],
      }

      const setIsOrderUnfillable = (params: SetIsOrderUnfillableParams) =>
        cowSwapStore.dispatch(createSetIsOrderUnfillableAction(params))

      ordersList = getOrdersTableList(
        reduxOrders,
        ordersTableFilters.orderType,
        chainId,
        balancesAndAllowances,
        pendingOrdersPermitValidityState,
        setIsOrderUnfillable,
      )

      const { searchTerm, historyStatusFilter } = get(ordersTableFiltersAtom)
      const ordersTableURLParams = get(ordersTableURLParamsAtom)
      const currentTabId = ordersTableURLParams.tab || OrderTabId.open;

      const orders = ordersList[currentTabId]

      console.log('orders =', orders, currentTabId)

      const filteredOrders = getFilteredOrders(orders, {
        searchTerm,
        // The status filter select is only visible in the story tab:
        historyStatusFilter: currentTabId === OrderTabId.history ? historyStatusFilter : HistoryStatusFilter.ALL,
      })

      // const hasHydratedOrders = useOrdersHydrationState({ chainId, orders: allOrders })
      const hasHydratedOrders = Array.isArray(orders)

      // Tabs:

      //const { currentTabId, currentPageNumber } = useCurrentTab(ordersList)
      // const tabs = useTabs(ordersList, currentTabId)

      set(ordersTableStateAtom, {
        reduxOrders,
        ordersList,
        orders,
        filteredOrders,
        balancesAndAllowances,
        // orderActions,
        hasHydratedOrders,
      })

      console.log('5')
    }

    /*
    // TODO: This was also in OrdersTableStateUpdater:

    set(partiallyUpdateOrdersTableFiltersAtom, {
      tabs,
      currentTabId,
      currentPageNumber
    })

    useEffect(() => {
      partiallyUpdateOrdersTableFilters({ currentTabId })
    }, [currentTabId])

    useEffect(() => {
      partiallyUpdateOrdersTableFilters({ currentPageNumber })
    }, [currentPageNumber])

    useEffect(() => {
      partiallyUpdateOrdersTableFilters({ tabs })
    }, [tabs])
    */
  }, jotaiStore)

  return () => {
    unobserve()
  }
}
