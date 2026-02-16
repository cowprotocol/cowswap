import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'

const PROD_ORDERS_PAGE_SIZE = 999
const PROD_ORDERS_LIMIT = PROD_ORDERS_PAGE_SIZE + 1
const MAX_PROD_PAGES_TO_SCAN = 20

export async function fetchMissingPartOrders(
  chainId: number,
  owner: string,
  partOrderIds: string[],
  existingOrdersByUid: Record<string, EnrichedOrder>,
): Promise<EnrichedOrder[]> {
  const missingPartIds = new Set(partOrderIds.filter((uid) => !existingOrdersByUid[uid]))
  if (!missingPartIds.size) return []

  const fetchedOrdersByUid: Record<string, EnrichedOrder> = {}

  for (let page = 0; page < MAX_PROD_PAGES_TO_SCAN && missingPartIds.size > 0; page++) {
    const offset = page * PROD_ORDERS_PAGE_SIZE
    const pageOrders = await getOrders({ owner, offset, limit: PROD_ORDERS_LIMIT }, { chainId, env: 'prod' })

    if (!pageOrders.length) break

    const hasNextPage = pageOrders.length > PROD_ORDERS_PAGE_SIZE
    const ordersToScan = hasNextPage ? pageOrders.slice(0, PROD_ORDERS_PAGE_SIZE) : pageOrders

    for (const order of ordersToScan) {
      if (missingPartIds.has(order.uid)) {
        fetchedOrdersByUid[order.uid] = order
        missingPartIds.delete(order.uid)
      }
    }

    if (!hasNextPage) break
  }

  return Object.values(fetchedOrdersByUid)
}
