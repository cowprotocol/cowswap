export interface OrderTab {
  id: string
  title: string
  count: number
  isActive?: boolean
}

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

export const ORDERS_TABLE_TABS: OrderTab[] = [OPEN_TAB, HISTORY_TAB]

export const ORDERS_TABLE_PAGE_SIZE = 10

export const ORDERS_TABLE_TAB_KEY = 'tab'
export const ORDERS_TABLE_PAGE_KEY = 'page'
