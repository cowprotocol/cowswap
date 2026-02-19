import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import type { Command } from '@cowprotocol/types'
import type { Token } from '@uniswap/sdk-core'

import { MessageDescriptor } from '@lingui/core'

import type { Order } from 'legacy/state/orders/actions'

import type { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'
import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import type { OrderTabId } from './tabs/ordersTableTabs.constants'

export interface OrdersTablePageParams {
  tabId: OrderTabId
  pageNumber: number
}

export enum TabOrderTypes {
  LIMIT = 'limit',
  ADVANCED = 'advanced',
}

export interface OrderTableGroup {
  parent: ParsedOrder
  children: ParsedOrder[]
}

export type OrderTableItem = OrderTableGroup | ParsedOrder

export type AlternativeOrderModalContext = { showAlternativeOrderModal: Command; isEdit: boolean } | null

export interface TabParams {
  id: OrderTabId
  title: MessageDescriptor
  count: number
  isActive?: boolean
}

export interface OrdersTableParams {
  orders: Order[]
  orderType: TabOrderTypes
  displayOrdersOnlyForSafeApp?: boolean
}

export interface OrderActions {
  getShowCancellationModal: (order: ParsedOrder) => UseCancelOrderReturn
  getAlternativeOrderModalContext: (order: ParsedOrder) => AlternativeOrderModalContext

  selectReceiptOrder(order: ParsedOrder): void

  toggleOrderForCancellation(order: ParsedOrder): void

  toggleOrdersForCancellation(orders: ParsedOrder[]): void

  approveOrderToken(token: Token): void
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

export type OrdersTableList = Record<OrderTabId, OrderTableItem[]>
