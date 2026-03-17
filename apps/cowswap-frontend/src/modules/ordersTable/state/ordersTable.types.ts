import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import type { Token } from '@cowprotocol/currency'
import type { Command } from '@cowprotocol/types'

import { MessageDescriptor } from '@lingui/core'

import type { Order } from 'legacy/state/orders/actions'

import type { HistoryStatusFilter } from 'modules/ordersTable/utils/getFilteredOrders'

import type { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'
import type { OrderTabId } from 'common/state/routesState'
import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

export type AlternativeOrderModalContext = { showAlternativeOrderModal: Command; isEdit: boolean } | null

export interface OrderActions {
  getShowCancellationModal: (order: ParsedOrder) => UseCancelOrderReturn
  getAlternativeOrderModalContext: (order: ParsedOrder) => AlternativeOrderModalContext
  selectReceiptOrder(order: ParsedOrder): void
  toggleOrderForCancellation(order: ParsedOrder): void
  toggleOrdersForCancellation(orders: ParsedOrder[]): void
  approveOrderToken(token: Token): void
}

export interface OrdersTableFilters {
  // Looking for order type, page number or tab id?
  // See apps/cowswap-frontend/src/common/state/routesState.ts

  // Query (not persisted in URL)
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
}

export type OrdersTableList = Record<OrderTabId, OrderTableItem[]>

export interface OrdersTablePageParams {
  tabId: OrderTabId
  pageNumber: number
}

export interface OrdersTableParams {
  orders: Order[]
}

/**
 * OrdersTableState derived from Redux orders, current route, current tab, and filters.
 */
export interface OrdersTableState {
  /**
   * All orders for the current route that belong to the current account:
   * - SWAP page => Limit orders
   * - LIMIT page => Limit orders
   * - ADVANCED page => TWAP orders (includes emulated twap orders + emulated part orders + discrete twap orders (from Redux)).
   * */
  reduxOrders: Order[]

  /** Orders in reduxOrders with status PENDING. Used for unfillable checks, permit validity, and pending UI. */
  pendingOrders: Order[]

  /** Orders bucketed by tab (open, history, unfillable, signing). Built by getOrdersTableList from reduxOrders. */
  ordersList: OrdersTableList

  /**
   * Orders for the currently selected tab only (`ordersList[currentTabId]`).
   * This is the list that is paginated and rendered in the table.
   * */
  orders: OrderTableItem[]

  /**
   * `orders` after applying search and history status filter.
   * This is the list that is paginated and rendered in the table.
   * */
  filteredOrders: OrderTableItem[]

  /**
   * True once orders have been loaded for the current chain/account/route.
   * Used to distinguish loading from empty state.
   * TODO: Currently not used.
   * */
  hasHydratedOrders: boolean

  /**
   * Balances and token allowances for tokens used by the orders in reduxOrders.
   * Used for balance display and permit/approval state.
   * */
  balancesAndAllowances: BalancesAndAllowances
}

export interface OrderTableGroup {
  parent: ParsedOrder
  children: ParsedOrder[]
}

export type OrderTableItem = OrderTableGroup | ParsedOrder

export interface TabParams {
  id: OrderTabId
  title: MessageDescriptor
  count: number
  isActive?: boolean
}
