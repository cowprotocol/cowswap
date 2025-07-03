export enum OrderTabId {
  all = 'all',
  unfillable = 'unfillable',
  signing = 'signing',
  open = 'open',
  history = 'history',
}

export interface OrderTab {
  id: OrderTabId
  title: string
  count: number
  isActive?: boolean
}

export const ORDERS_TABLE_TABS: OrderTab[] = [
  {
    id: OrderTabId.all,
    title: 'All orders',
    count: 0,
  },
  {
    id: OrderTabId.unfillable,
    title: 'Unfillable',
    count: 0,
  },
  {
    id: OrderTabId.signing,
    title: 'Signing',
    count: 0,
  },
  {
    id: OrderTabId.open,
    title: 'Open',
    count: 0,
  },
  {
    id: OrderTabId.history,
    title: 'Orders history',
    count: 0,
  },
]

export const ORDERS_TABLE_PAGE_SIZE = 10

export const ORDERS_TABLE_TAB_KEY = 'tab'
export const ORDERS_TABLE_PAGE_KEY = 'page'
