import { ORDERS_TABLE_PAGE_KEY, ORDERS_TABLE_TAB_KEY, ORDERS_TABLE_TABS } from '../const/tabs'
import { OrdersTablePageParams } from '../types'

const ordersTableTabsIds = ORDERS_TABLE_TABS.map((item) => item.id)

export function parseOrdersTableUrl(search: string): Partial<OrdersTablePageParams> {
  const params = new URLSearchParams(search)

  const tabIdRaw = params.get(ORDERS_TABLE_TAB_KEY) || ''
  const tabId = ordersTableTabsIds.includes(tabIdRaw) ? tabIdRaw : undefined

  const pageNumberRaw = params.get(ORDERS_TABLE_PAGE_KEY) || undefined
  const pageNumber = pageNumberRaw && /^\d+$/.test(pageNumberRaw) ? +pageNumberRaw : undefined

  return { tabId, pageNumber }
}
