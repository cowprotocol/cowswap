import { Command } from '@cowprotocol/types'
import { Token } from '@uniswap/sdk-core'

import { UseCancelOrderReturn } from 'common/hooks/useCancelOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export interface OrderActions {
  getShowCancellationModal: (order: ParsedOrder) => UseCancelOrderReturn
  getShowRecreateModal: (order: ParsedOrder) => Command | null
  selectReceiptOrder(order: ParsedOrder): void
  toggleOrderForCancellation(order: ParsedOrder): void
  toggleOrdersForCancellation(orders: ParsedOrder[]): void
  approveOrderToken(token: Token): void
}
