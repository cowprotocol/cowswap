import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Command } from '@cowprotocol/types'
import type { CowSwapWidgetAppParams } from '@cowprotocol/widget-lib'
import type { Currency, Price, Token } from '@uniswap/sdk-core'

import type { Order } from 'legacy/state/orders/actions'

import type { PendingOrdersPrices, SpotPricesKeyParams } from 'modules/orders'
import type { BalancesAndAllowances } from 'modules/tokens'

import type { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'
import type { CancellableOrder } from 'common/utils/isOrderCancellable'
import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import type { OrderTabId } from './const/tabs'

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
  title: string
  count: number
  isActive?: boolean
}

export interface OrdersTableParams {
  orders: Order[]
  orderType: TabOrderTypes
  isTwapTable?: boolean
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
  isWalletConnected: boolean
  isSafeViaWc: boolean
  displayOrdersOnlyForSafeApp: boolean
  orderType: TabOrderTypes
  injectedWidgetParams: Partial<CowSwapWidgetAppParams>
  tabs: TabParams[]
  chainId: SupportedChainId
  orders: OrderTableItem[]
  filteredOrders: OrderTableItem[]
  allowsOffchainSigning: boolean
  balancesAndAllowances: BalancesAndAllowances
  orderActions: OrderActions
  currentPageNumber: number
  pendingOrdersPrices: PendingOrdersPrices
  getSpotPrice: (params: SpotPricesKeyParams) => Price<Currency, Currency> | null
  pendingActivities: string[]
  isTwapTable: boolean
  selectedOrders: CancellableOrder[]
}

export type OrdersTableList = Record<OrderTabId, OrderTableItem[]>
