import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'

export const ordersSorter = (a: ParsedOrder, b: ParsedOrder) => Date.parse(b.creationTime) - Date.parse(a.creationTime)
