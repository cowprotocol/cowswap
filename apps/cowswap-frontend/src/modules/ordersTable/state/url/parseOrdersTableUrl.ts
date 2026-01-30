import { OrdersTablePageParams } from '../ordersTable.types'
import { ORDERS_TABLE_PAGE_KEY, ORDERS_TABLE_TAB_KEY, OrderTabId } from '../tabs/ordersTableTabs.constants'

export function parseOrdersTableUrl(search: string): Partial<OrdersTablePageParams> {
  const params = new URLSearchParams(search)

  const tabIdRaw = params.get(ORDERS_TABLE_TAB_KEY) || ''
  const tabId = tabIdRaw in OrderTabId ? (tabIdRaw as OrderTabId) : undefined

  const pageNumberRaw = params.get(ORDERS_TABLE_PAGE_KEY) || undefined
  const pageNumber = pageNumberRaw && /^\d+$/.test(pageNumberRaw) ? +pageNumberRaw : undefined

  return { tabId, pageNumber }
}
