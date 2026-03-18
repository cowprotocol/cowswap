import { MessageDescriptor } from '@lingui/core'

import { OrderTabId } from 'common/state/routesState'

export interface OrderTab {
  id: OrderTabId
  title: MessageDescriptor
  count: number
  isActive?: boolean
}

export const ORDERS_TABLE_PAGE_SIZE = 10

export const ORDERS_TABLE_TAB_KEY = 'tab'
export const ORDERS_TABLE_PAGE_KEY = 'page'
