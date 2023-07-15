import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export interface OrderTableGroup {
  parent: ParsedOrder
  children: ParsedOrder[]
}

export type OrderTableItem = OrderTableGroup | ParsedOrder

export const isParsedOrder = (item: OrderTableItem): item is ParsedOrder => item.hasOwnProperty('creationTime')

export const getParsedOrderFromItem = (item: OrderTableItem): ParsedOrder => (isParsedOrder(item) ? item : item.parent)

export function tableItemsToOrders(items: OrderTableItem[]): ParsedOrder[] {
  return items.map(getParsedOrderFromItem)
}
