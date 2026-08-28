import { Command } from '@cowprotocol/types'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export function getReceiptCancellationAction(
  order: ParsedOrder | null,
  getCancellationAction: (order: ParsedOrder) => Command | null,
): Command | null {
  // Whole-order EOA TWAP cancellation is not implemented. Do not offer an action that fails after confirmation.
  if (!order || order.isEoaTwapOrder) return null

  return getCancellationAction(order)
}
