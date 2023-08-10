import { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export interface OrderActions {
  getShowCancellationModal: (order: ParsedOrder) => UseCancelOrderReturn
  selectReceiptOrder(order: ParsedOrder): void
  toggleOrderForCancellation(order: ParsedOrder): void
  toggleOrdersForCancellation(orders: ParsedOrder[]): void
}
