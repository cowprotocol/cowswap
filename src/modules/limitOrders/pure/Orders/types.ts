import { UID } from '@cowprotocol/cow-sdk'

import { Order } from 'legacy/state/orders/actions'

import { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'

export interface LimitOrderActions {
  getShowCancellationModal: (order: Order) => UseCancelOrderReturn
  selectReceiptOrder(orderId: UID): void
  toggleOrderForCancellation(order: Order): void
  toggleOrdersForCancellation(orders: Order[]): void
}
