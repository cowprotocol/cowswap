import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export enum OrderTabId {
  signing = 'signing',
  unfillable = 'unfillable',
  open = 'open',
  history = 'history',
}

export interface OrderTab {
  id: OrderTabId
  title: MessageDescriptor
  count: number
  isActive?: boolean
}

export const ORDERS_TABLE_TABS: OrderTab[] = [
  {
    id: OrderTabId.signing,
    title: msg`Signing`,
    count: 0,
  },
  {
    id: OrderTabId.unfillable,
    title: msg`Unfillable`,
    count: 0,
  },
  {
    id: OrderTabId.open,
    title: msg`Open`,
    count: 0,
  },
  {
    id: OrderTabId.history,
    title: msg`Orders history`,
    count: 0,
  },
]

export const ORDERS_TABLE_PAGE_SIZE = 10

export const ORDERS_TABLE_TAB_KEY = 'tab'
export const ORDERS_TABLE_PAGE_KEY = 'page'
