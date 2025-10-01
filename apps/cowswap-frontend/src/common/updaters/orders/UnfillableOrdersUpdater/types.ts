import { Order } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export type OrderToCheckFillability = Order | ParsedOrder
