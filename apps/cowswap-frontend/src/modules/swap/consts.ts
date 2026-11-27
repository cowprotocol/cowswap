import { OrderKind } from '@cowprotocol/cow-sdk'

import { ExtendedTradeRawState } from '../trade'

/** Orderbook caps the waived volume fee at 2 bps. A wider quote gap is two different prices. */
export const WAIT_AND_SAVE_DISCONNECT_GAP_BPS = 2n

/**
 * Buy orders are not allowed for selling ETH
 * So we reset the state when user tries to switch tokens
 */
export const SELL_ETH_RESET_STATE: Partial<ExtendedTradeRawState> = {
  orderKind: OrderKind.SELL,
  inputCurrencyAmount: null,
  outputCurrencyAmount: null,
}
