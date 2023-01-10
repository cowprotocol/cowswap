import { OrderTab } from '@cow/modules/limitOrders/pure/Orders/OrdersTabs'

export const OPEN_TAB: OrderTab = {
  id: 'open',
  title: 'Open orders',
  count: 0,
}

export const HISTORY_TAB: OrderTab = {
  id: 'history',
  title: 'Orders history',
  count: 0,
}

export const LIMIT_ORDERS_TABS: OrderTab[] = [OPEN_TAB, HISTORY_TAB]

export const LIMIT_ORDERS_PAGE_SIZE = 10
