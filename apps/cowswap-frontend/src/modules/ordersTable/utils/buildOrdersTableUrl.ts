import { ORDERS_TABLE_PAGE_KEY, ORDERS_TABLE_TAB_KEY } from '../const/tabs'
import { OrdersTablePageParams } from '../types'

export function buildOrdersTableUrl(
  { pathname, search }: Pick<Location, 'pathname' | 'search'>,
  { tabId, pageNumber }: Partial<OrdersTablePageParams>,
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
