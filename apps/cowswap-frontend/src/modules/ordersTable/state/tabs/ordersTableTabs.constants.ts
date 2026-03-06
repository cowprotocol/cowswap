import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

import { OrderTabId } from 'common/state/routesState'

export interface OrderTab {
  id: OrderTabId
  title: MessageDescriptor
  count: number
  isActive?: boolean
}

export const ORDERS_TABLE_TABS: OrderTab[] = [
  {
    id: OrderTabId.SIGNING,
    title: msg`Signing`,
    count: 0,
  },
  {
    id: OrderTabId.OPEN,
    title: msg`Open`,
    count: 0,
  },
  {
    id: OrderTabId.UNFILLABLE,
    title: msg`Unfillable`,
    count: 0,
  },
  {
    id: OrderTabId.HISTORY,
    title: msg`Orders history`,
    count: 0,
  },
]

export const ORDERS_TABLE_PAGE_SIZE = 10

export const ORDERS_TABLE_TAB_KEY = 'tab'
export const ORDERS_TABLE_PAGE_KEY = 'page'
