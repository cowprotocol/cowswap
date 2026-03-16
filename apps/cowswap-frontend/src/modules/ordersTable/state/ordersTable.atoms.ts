import { atom } from 'jotai'

import {
  BalancesAndAllowances,
  balancesAtom,
  tokenAllowancesLoadableFamily,
} from '@cowprotocol/balances-and-allowances'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
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
import { _concatOrdersState } from 'legacy/state/orders/hooks'
import { ORDER_LIST_KEYS, OrdersState, OrdersStateNetwork, getDefaultNetworkState } from 'legacy/state/orders/reducer'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'
import { atomFromReduxSelector } from 'legacy/utils/atomFromReduxSelector'

import { HistoryStatusFilter, getFilteredOrders } from 'modules/ordersTable/utils/getFilteredOrders'
import { getOrdersTableList } from 'modules/ordersTable/utils/getOrdersTableList'
import { emulatedPartOrdersAtom } from 'modules/twap/state/emulatedPartOrdersAtom'
import { emulatedTwapOrdersAtom } from 'modules/twap/state/emulatedTwapOrdersAtom'

import { TabOrderTypes, locationOrderTypeAtom, tabParamAtom, OrderTabId } from 'common/state/routesState'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrdersTableState, OrdersTableFilters } from './ordersTable.types'
import { pendingOrdersPermitValidityStateAtom } from './permit/pendingOrdersPermitValidity.atom'

export const ordersTableStateAtom = atom<OrdersTableState>({
  reduxOrders: [],
  pendingOrders: [],
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
  // orderType: TabOrderTypes.LIMIT,
  // currentPageNumber: 1, // TODO: Init from URL...
  // tabs: [],
  // currentTabId: OrderTabId.OPEN, // TODO: Init from URL...
  searchTerm: '',
  historyStatusFilter: HistoryStatusFilter.FILLED,
} as const satisfies OrdersTableFilters

export const ordersTableFiltersAtom = atom<OrdersTableFilters>(DEFAULT_ORDERS_TABLE_FILTERS)

export const { updateAtom: partiallyUpdateOrdersTableFiltersAtom } = atomWithPartialUpdate(ordersTableFiltersAtom)

ordersTableFiltersAtom.onMount = () => {
  observe((get, set) => {
    get(tabParamAtom)

    // Reset filters if tab changes:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

function setIsOrderUnfillable(params: SetIsOrderUnfillableParams): void {
  cowSwapStore.dispatch(createSetIsOrderUnfillableAction(params))
}

// eslint-disable-next-line max-lines-per-function
ordersTableStateAtom.onMount = () => {
  // eslint-disable-next-line max-lines-per-function
  const unobserve = observe((get, set) => {
    const { chainId, account } = get(walletInfoAtom)
    const selectReduxOrdersStateByChain = get(reduxOrdersStateByChainAtom)
    const reduxOrdersStateInCurrentChain = selectReduxOrdersStateByChain(chainId)

    console.log('1. reduxOrdersStateInCurrentChain =', reduxOrdersStateInCurrentChain)

    let reduxOrders: Order[] = []

    const ordersTokensSet = new Set<string>()

    if (reduxOrdersStateInCurrentChain && account) {
      const orderType = get(locationOrderTypeAtom)

      const uiOrderType: UiOrderType = {
        [TabOrderTypes.SWAP]: UiOrderType.LIMIT, // TODO: Is this correct (for AffectedPermitOrdersTable / SwapPage)?
        [TabOrderTypes.LIMIT]: UiOrderType.LIMIT,
        [TabOrderTypes.ADVANCED]: UiOrderType.TWAP,
      }[orderType]

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
        const orderType = getUiOrderType(order.order)
        const doesMatchClass = orderType === uiOrderType

        if (!doesBelongToAccount || !doesMatchClass) return

        const mappedOrder = deserializeOrder(order)

        if (!mappedOrder || mappedOrder.isHidden) return

        reduxOrders.push(mappedOrder)
        ordersTokensSet.add(getAddressKey(mappedOrder.inputToken.address))
      })

      console.log('orderType =', orderType)

      if (orderType === TabOrderTypes.ADVANCED) {
        /*
        TWAP:

        const allEmulatedOrders = useAllEmulatedOrders()

        const pendingOrders = allEmulatedOrders.filter((order) => order.status === OrderStatus.PENDING)

        // Then allEmulatedOrders goes into the updater
        */

        const isBundlingSupportedLoadable = get(isBundlingSupportedLoadableAtom)
        // const isBundlingSupported = isBundlingSupportedLoadable.state === 'hasData' ? !!isBundlingSupportedLoadable.data : false
        const isBundlingSupported = true

        console.log('isBundlingSupported =', isBundlingSupportedLoadable)

        if (!isBundlingSupported) {
          reduxOrders = []
        } else {
          // reduxOrders = useOrders(chainId, account, UiOrderType.TWAP)

          // const twapOrdersTokens = useTwapOrdersTokens() // emulatedTwapOrdersAtom and emulatedPartOrdersAtom access twapOrdersTokens on their own

          const emulatedTwapOrders = get(emulatedTwapOrdersAtom)
          const emulatedPartOrders = get(emulatedPartOrdersAtom)

          const discreteTwapOrders = reduxOrders.filter((order) => order.composableCowInfo?.isVirtualPart === false)

          // TODO: AdvancedOrdersPage needs this plus pendingOrders:
          // const pendingOrders = allEmulatedOrders.filter((order) => order.status === OrderStatus.PENDING)

          reduxOrders = emulatedTwapOrders.concat(emulatedPartOrders).concat(discreteTwapOrders)
        }
      } else if (orderType === TabOrderTypes.LIMIT) {
        /*
        Limit:

        const allLimitOrders = useOrders(chainId, account, UiOrderType.LIMIT)

        const pendingLimitOrders = useMemo(
          () => allLimitOrders.filter((order) => order.status === OrderStatus.PENDING),
          [allLimitOrders],
        )

        Then allLimitOrders goes into the updater

        No extra processing here, we just continue with reduxOrders...

        */
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

      const { searchTerm, historyStatusFilter } = get(ordersTableFiltersAtom)

      // TODO: Instead, create allowedTabParamAtom with logic in useCurrentTab(). Or simply add the property to ordersTableStateAtom...
      const currentTabId = get(tabParamAtom)

      const orders = ordersList[currentTabId]

      // TODO: Check here if currentTab Id has orders or if a different tab should be shown. Return the right data regardless of currentTabId. Redirect will happen shortly.

      console.log(`4. orders (${currentTabId}) =`, orders)

      const filteredOrders = getFilteredOrders(orders, {
        searchTerm,
        // The status filter select is only visible in the story tab:
        historyStatusFilter: currentTabId === OrderTabId.HISTORY ? historyStatusFilter : HistoryStatusFilter.ALL,
      })

      console.log(`5. filteredOrders (${currentTabId}) =`, filteredOrders)

      // const hasHydratedOrders = useOrdersHydrationState({ chainId, orders: allOrders })
      const hasHydratedOrders = Array.isArray(orders)

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

  return () => {
    unobserve()
  }
}

// TODO: Maybe create separate limitOrdersTable, twapOrdersTable and reduxOrders atom with onMount
