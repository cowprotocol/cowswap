import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import type { Token } from '@cowprotocol/currency'
import type { Command } from '@cowprotocol/types'

import { MessageDescriptor } from '@lingui/core'

import type { Order } from 'legacy/state/orders/actions'

import type { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'
import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import type { OrderTabId } from './tabs/ordersTableTabs.constants'

export type AlternativeOrderModalContext = { showAlternativeOrderModal: Command; isEdit: boolean } | null

export type OrdersTableHistoryStatusFilterOverride = 'filled' | 'cancelled' | 'expired' | 'all'

export interface OrderActions {
  getShowCancellationModal: (order: ParsedOrder) => UseCancelOrderReturn
  getAlternativeOrderModalContext: (order: ParsedOrder) => AlternativeOrderModalContext

  selectReceiptOrder(order: ParsedOrder): void

  toggleOrderForCancellation(order: ParsedOrder): void

  toggleOrdersForCancellation(orders: ParsedOrder[]): void

  approveOrderToken(token: Token): void
}

export interface OrderTableGroup {
  parent: ParsedOrder
  children: ParsedOrder[]
}

export type OrderTableItem = OrderTableGroup | ParsedOrder

export enum TabOrderTypes {
  LIMIT = 'limit',
  ADVANCED = 'advanced',
}

export type OrdersTableList = Record<OrderTabId, OrderTableItem[]>

export interface OrdersTablePageParams {
  tabId: OrderTabId
  pageNumber: number
}

export interface OrdersTableParams {
  orders: Order[]
  orderType: TabOrderTypes
  displayOrdersOnlyForSafeApp?: boolean
}

export interface OrdersTableState {
  currentTabId: OrderTabId
  displayOrdersOnlyForSafeApp: boolean
  orderType: TabOrderTypes
  tabs: TabParams[]
  orders: OrderTableItem[]
  filteredOrders: OrderTableItem[]
  hasHydratedOrders: boolean
  balancesAndAllowances: BalancesAndAllowances
  orderActions: OrderActions
  currentPageNumber: number
}

export interface TabParams {
  id: OrderTabId
  title: MessageDescriptor
  count: number
  isActive?: boolean
}
