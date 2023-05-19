import { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'
import { UID } from '@cowprotocol/cow-sdk'
import { Order } from 'state/orders/actions'

export interface LimitOrderActions {
  getShowCancellationModal: (order: Order) => UseCancelOrderReturn
  selectReceiptOrder(orderId: UID): void
  toggleOrderForCancellation(order: Order): void
  toggleOrdersForCancellation(orders: Order[]): void
}
