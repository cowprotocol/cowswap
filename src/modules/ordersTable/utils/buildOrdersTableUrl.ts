import { Location } from 'history'

import { ORDERS_TABLE_TABS } from 'modules/ordersTable/const/tabs'

const ORDERS_TABLE_TAB_KEY = 'tab'
const ORDERS_TABLE_PAGE_KEY = 'page'

const ordersTableTabsIds = ORDERS_TABLE_TABS.map((item) => item.id)

export interface OrdersTablePageParams {
  tabId: string
  pageNumber: number
}

export function buildOrdersTableUrl(
  { pathname, search }: Pick<Location, 'pathname' | 'search'>,
  { tabId, pageNumber }: Partial<OrdersTablePageParams>
): Partial<{ pathname: string; search: string }> {
  const query = new URLSearchParams(search)

  if (tabId) {
    query.set(ORDERS_TABLE_TAB_KEY, tabId)
  }

  if (pageNumber) {
    query.set(ORDERS_TABLE_PAGE_KEY, pageNumber.toString())
  }

  return { pathname, search: query.toString() }
}

export function parseOrdersTableUrl(search: string): Partial<OrdersTablePageParams> {
  const params = new URLSearchParams(search)

  const tabIdRaw = params.get(ORDERS_TABLE_TAB_KEY) || ''
  const tabId = ordersTableTabsIds.includes(tabIdRaw) ? tabIdRaw : undefined

  const pageNumberRaw = params.get(ORDERS_TABLE_PAGE_KEY) || undefined
  const pageNumber = pageNumberRaw && /^\d+$/.test(pageNumberRaw) ? +pageNumberRaw : undefined

  return { tabId, pageNumber }
}
