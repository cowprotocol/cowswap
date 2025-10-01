import { OrderToCheckFillability } from '../types'

export function getOrdersPageChunk(
  orders: OrderToCheckFillability[],
  pageSize: number,
  pageNumber: number,
): OrderToCheckFillability[] {
  const start = (pageNumber - 1) * pageSize
  const end = start + pageSize
  return orders.slice(start, end)
}
