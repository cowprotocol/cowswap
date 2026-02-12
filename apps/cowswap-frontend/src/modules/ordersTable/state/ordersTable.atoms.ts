import { atom } from 'jotai'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { balancesAtom } from '@cowprotocol/balances-and-allowances'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

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

import { HistoryStatusFilter, getFilteredOrders } from 'modules/ordersTable/utils/getFilteredOrders'
import { getOrdersTableList } from 'modules/ordersTable/utils/getOrdersTableList'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrdersTableState, OrdersTableFilters, TabOrderTypes } from './ordersTable.types'
import { tabParamAtom } from './params/ordersTableParams.atoms'
import { pendingOrdersPermitValidityStateAtom } from './permit/pendingOrdersPermitValidity.atom'
import { OrderTabId } from './tabs/ordersTableTabs.constants'

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

export const { updateAtom: partiallyUpdateOrdersTableFiltersAtom } = atomWithPartialUpdate(ordersTableFiltersAtom)

ordersTableFiltersAtom.onMount = () => {
  observe((get, set) => {
    get(tabParamAtom)

    // Reset filters if tab changes:
    set(partiallyUpdateOrdersTableFiltersAtom as any, {
      searchTerm: '',
      historyStatusFilter: HistoryStatusFilter.FILLED,
    })
  })
}

const reduxOrdersStateAtom = atomFromReduxSelector<OrdersState>((appState) => appState.orders)

const reduxOrdersStateByChainAtom = atom((get) => (chainId: SupportedChainId) => {
  if (!chainId) return {} as OrdersStateNetwork

  const reduxOrdersStateByChain = get(reduxOrdersStateAtom)?.[chainId] || {}

  return { ...getDefaultNetworkState(chainId), ...reduxOrdersStateByChain }
})

ordersTableStateAtom.onMount = () => {
  const unobserve = observe((get, set) => {
    const { chainId, account } = get(walletInfoAtom)
    const selectReduxOrdersStateByChain = get(reduxOrdersStateByChainAtom)
    const reduxOrdersStateInCurrentChain = selectReduxOrdersStateByChain(chainId)

    console.log('1. reduxOrdersStateInCurrentChain =', reduxOrdersStateInCurrentChain)

    const reduxOrders: Order[] = []
    const ordersTokensSet = new Set<string>()

    if (reduxOrdersStateInCurrentChain && account) {
      const ordersTableFilters = get(ordersTableFiltersAtom)

      const accountLowerCase = account.toLowerCase()

      // TODO: Map this directly from the URL:
      const uiOrderType: UiOrderType = {
        [TabOrderTypes.LIMIT]: UiOrderType.LIMIT,
        [TabOrderTypes.ADVANCED]: UiOrderType.TWAP,
      }[ordersTableFilters.orderType]

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

      // TODO: Can this be optimized instead of looping through orders various times?

      // TODO: Also extract pending in the same loop.

      // TODO: TWAPs need additional processing, do it in the same loop.

      // TODO: Maybe instead of using _concatOrdersState we can process only the ones we need (mapping ordersTableFilters.orderType to OrderTypeKeys)

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

      console.log('2. reduxOrders =', reduxOrders)

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

      const setIsOrderUnfillable = (params: SetIsOrderUnfillableParams) =>
        cowSwapStore.dispatch(createSetIsOrderUnfillableAction(params))

      const ordersList = getOrdersTableList(
        reduxOrders,
        ordersTableFilters.orderType,
        chainId,
        balancesAndAllowances,
        pendingOrdersPermitValidityState,
        setIsOrderUnfillable,
      )

      console.log('3. ordersList =', ordersList)

      const { searchTerm, historyStatusFilter } = get(ordersTableFiltersAtom)
      const currentTabId = get(tabParamAtom)

      const orders = ordersList[currentTabId]

      console.log(`4. orders (${currentTabId}) =`, orders)

      const filteredOrders = getFilteredOrders(orders, {
        searchTerm,
        // The status filter select is only visible in the story tab:
        historyStatusFilter: currentTabId === OrderTabId.history ? historyStatusFilter : HistoryStatusFilter.ALL,
      })

      console.log(`5. filteredOrders (${currentTabId}) =`, filteredOrders)

      // const hasHydratedOrders = useOrdersHydrationState({ chainId, orders: allOrders })
      const hasHydratedOrders = Array.isArray(orders)

      set(ordersTableStateAtom, {
        reduxOrders,
        ordersList,
        orders,
        filteredOrders,
        balancesAndAllowances,
        hasHydratedOrders,
      })

      console.log('5')
    }
  }, jotaiStore)

  return () => {
    unobserve()
  }
}
