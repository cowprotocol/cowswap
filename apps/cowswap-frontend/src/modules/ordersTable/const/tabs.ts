export interface OrderTab {
  id: string
  title: string
  count: number
  isActive?: boolean
}

export const ALL_ORDERS_TAB: OrderTab = {
  id: 'all',
  title: 'All orders',
  count: 0,
}

export const UNFILLABLE_TAB: OrderTab = {
  id: 'unfillable',
  title: 'Unfillable',
  count: 0,
}

export const SIGNING_TAB: OrderTab = {
  id: 'signing',
  title: 'Signing',
  count: 0,
}

export const OPEN_TAB: OrderTab = {
  id: 'open',
  title: 'Open',
  count: 0,
}

export const HISTORY_TAB: OrderTab = {
  id: 'history',
  title: 'Orders history',
  count: 0,
}

export const ORDERS_TABLE_TABS: OrderTab[] = [ALL_ORDERS_TAB, UNFILLABLE_TAB, SIGNING_TAB, OPEN_TAB, HISTORY_TAB]

export const ORDERS_TABLE_PAGE_SIZE = 10

export const ORDERS_TABLE_TAB_KEY = 'tab'
export const ORDERS_TABLE_PAGE_KEY = 'page'
