import { Token } from '@uniswap/sdk-core'

import { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { AlternativeOrderModalContext } from '../../containers/OrdersReceiptModal/hooks'

export interface OrderActions {
  getShowCancellationModal: (order: ParsedOrder) => UseCancelOrderReturn
  getAlternativeOrderModalContext: (order: ParsedOrder) => AlternativeOrderModalContext
  selectReceiptOrder(order: ParsedOrder): void
  toggleOrderForCancellation(order: ParsedOrder): void
  toggleOrdersForCancellation(orders: ParsedOrder[]): void
  approveOrderToken(token: Token): void
}
