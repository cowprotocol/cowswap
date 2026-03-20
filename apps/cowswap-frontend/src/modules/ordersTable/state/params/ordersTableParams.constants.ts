import { MessageDescriptor } from '@lingui/core'

import { OrderTabId } from 'common/state/routesState'

export interface OrderTab {
  id: OrderTabId
  title: MessageDescriptor
  count: number
  isActive?: boolean
}

// Tab:
export const ORDERS_TABLE_TAB_KEY = 'tab'

// Page:
export const ORDERS_TABLE_PAGE_KEY = 'page'
export const ORDERS_TABLE_PAGE_SIZE = 10
