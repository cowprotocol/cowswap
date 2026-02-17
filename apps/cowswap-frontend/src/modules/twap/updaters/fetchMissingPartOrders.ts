import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'

const PROD_ORDERS_PAGE_SIZE = 999
const PROD_ORDERS_LIMIT = PROD_ORDERS_PAGE_SIZE + 1
const MAX_PROD_PAGES_TO_SCAN = 20

function shouldStopScanning(
  orders: EnrichedOrder[],
  missingPartIds: Set<string>,
  fetchedOrdersByUid: Record<string, EnrichedOrder>,
): boolean {
  if (!orders.length) return true

  const hasNextPage = orders.length > PROD_ORDERS_PAGE_SIZE
  const ordersToScan = hasNextPage ? orders.slice(0, PROD_ORDERS_PAGE_SIZE) : orders

  for (const order of ordersToScan) {
    if (!missingPartIds.has(order.uid)) continue

    fetchedOrdersByUid[order.uid] = order
    missingPartIds.delete(order.uid)
  }

  return !hasNextPage
}

export async function fetchMissingPartOrders(
  chainId: number,
  owner: string,
  partOrderIds: string[],
  existingOrdersByUid: Record<string, EnrichedOrder>,
  signal?: AbortSignal,
): Promise<EnrichedOrder[]> {
  const missingPartIds = new Set(partOrderIds.filter((uid) => !existingOrdersByUid[uid]))
  if (!missingPartIds.size) return []

  const fetchedOrdersByUid: Record<string, EnrichedOrder> = {}

  for (let page = 0; page < MAX_PROD_PAGES_TO_SCAN && missingPartIds.size > 0; page++) {
    if (signal?.aborted) break

    const offset = page * PROD_ORDERS_PAGE_SIZE
    const pageOrders = await getOrders({ owner, offset, limit: PROD_ORDERS_LIMIT }, { chainId, env: 'prod' })
    if (signal?.aborted) break

    const shouldStop = shouldStopScanning(pageOrders, missingPartIds, fetchedOrdersByUid)
    if (shouldStop) break
  }

  return Object.values(fetchedOrdersByUid)
}
