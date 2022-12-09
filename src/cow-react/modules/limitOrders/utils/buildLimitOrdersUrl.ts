import { Location } from 'history'
import { LIMIT_ORDERS_TABS } from '@cow/modules/limitOrders/const/limitOrdersTabs'

const LIMIT_ORDERS_TAB_KEY = 'tab'
const LIMIT_ORDERS_PAGE_KEY = 'page'

const limitOrdersTabsIds = LIMIT_ORDERS_TABS.map((item) => item.id)

export interface LimitOrdersPageParams {
  tabId: string
  pageNumber: number
}

export function buildLimitOrdersUrl(
  { pathname, search }: Pick<Location, 'pathname' | 'search'>,
  { tabId, pageNumber }: Partial<LimitOrdersPageParams>
): string {
  const query = new URLSearchParams(search)

  if (tabId) {
    query.set(LIMIT_ORDERS_TAB_KEY, tabId)
  }

  if (pageNumber) {
    query.set(LIMIT_ORDERS_PAGE_KEY, pageNumber.toString())
  }

  return pathname + '?' + query
}

export function parseLimitOrdersPageParams(search: string): Partial<LimitOrdersPageParams> {
  const params = new URLSearchParams(search)

  const tabIdRaw = params.get(LIMIT_ORDERS_TAB_KEY) || ''
  const tabId = limitOrdersTabsIds.includes(tabIdRaw) ? tabIdRaw : undefined

  const pageNumberRaw = params.get(LIMIT_ORDERS_PAGE_KEY) || undefined
  const pageNumber = pageNumberRaw && /^\d+$/.test(pageNumberRaw) ? +pageNumberRaw : undefined

  return { tabId, pageNumber }
}
