import { Order } from 'state/orders/actions'

export const ordersSorter = (a: Order, b: Order) => Date.parse(b.creationTime) - Date.parse(a.creationTime)
