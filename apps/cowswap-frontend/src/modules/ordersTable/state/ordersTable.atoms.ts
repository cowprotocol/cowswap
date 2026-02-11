import { atom } from 'jotai'
import { jotaiStore } from '@cowprotocol/core'
import { observe } from 'jotai-effect'

import { OrdersTableState, OrdersTableFilters, TabOrderTypes } from './ordersTable.types'
import { OrderTabId } from './tabs/ordersTableTabs.constants'
import { HistoryStatusFilter } from 'modules/ordersTable/hooks/useFilteredOrders'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { ORDER_LIST_KEYS, OrdersState, OrdersStateNetwork } from 'legacy/state/orders/reducer'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atomFromReduxSelector } from 'legacy/utils/atomFromReduxSelector'
import { getDefaultNetworkState } from 'legacy/state/orders/reducer'
import { _concatOrdersState } from 'legacy/state/orders/hooks'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { UiOrderType } from '@cowprotocol/types'
import { Order } from 'legacy/state/orders/actions'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'

export const ordersTableStateAtom = atom<OrdersTableState | null>(null)

export const DEFAULT_ORDERS_TABLE_FILTERS = {
  orderType: TabOrderTypes.LIMIT,
  currentPageNumber: 1,
  tabs: [],
  currentTabId: OrderTabId.open,
  searchTerm: '',
  historyStatusFilter: HistoryStatusFilter.FILLED,
  displayOrdersOnlyForSafeApp: false,
} as const satisfies OrdersTableFilters

export const ordersTableFiltersAtom = atom<OrdersTableFilters>(DEFAULT_ORDERS_TABLE_FILTERS)

const reduxOrdersStateAtom = atomFromReduxSelector<OrdersState>((appState) => appState.orders)

const reduxOrdersStateByChainAtom = atom((get) => (chainId: SupportedChainId) => {
  if (!chainId) return {} as OrdersStateNetwork

  const reduxOrdersStateByChain = get(reduxOrdersStateAtom)?.[chainId] || {}

  return { ...getDefaultNetworkState(chainId), ...reduxOrdersStateByChain }
})

export const { updateAtom: partiallyUpdateOrdersTableFiltersAtom } = atomWithPartialUpdate(ordersTableFiltersAtom)

ordersTableStateAtom.onMount = () => {
  console.log("ordersTableStateAtom onMount");

  const unobserve = observe((get, set) => {
    const { chainId, account } = get(walletInfoAtom)
    const ordersTableFilters = get(ordersTableFiltersAtom)
    const selectReduxOrdersStateByChain = get(reduxOrdersStateByChainAtom);
    const reduxOrdersStateInCurrentChain = selectReduxOrdersStateByChain(chainId);

    console.log("New data: ", { chainId, account, ordersTableFilters, reduxOrdersStateInCurrentChain });

    let orders: Order[] = []

    if (reduxOrdersStateInCurrentChain) {
      const accountLowerCase = account?.toLowerCase()

      const uiOrderType: UiOrderType = {
        [TabOrderTypes.LIMIT]: UiOrderType.LIMIT,
        [TabOrderTypes.ADVANCED]: UiOrderType.TWAP,
      }[ordersTableFilters.orderType]

      // TODO: In the same loop, generate all this:

      /*
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

      orders = _concatOrdersState(reduxOrdersStateInCurrentChain, ORDER_LIST_KEYS).reduce((acc, order) => {
        if (!order) return acc

        const doesBelongToAccount = order.order.owner.toLowerCase() === accountLowerCase
        const orderType = getUiOrderType(order.order)
        const doesMatchClass = orderType === uiOrderType

        if (doesBelongToAccount && doesMatchClass) {
          const mappedOrder = deserializeOrder(order)

          if (mappedOrder && !mappedOrder.isHidden) {
            acc.push(mappedOrder)
          }
        }

        return acc
      }, [] as Order[]);
    }

    set(ordersTableStateAtom, {
      orders,
    } as any)
  }, jotaiStore)

  return () => {
    unobserve();
  }
}
