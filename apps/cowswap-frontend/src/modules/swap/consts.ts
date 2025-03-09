import { OrderKind } from '@cowprotocol/cow-sdk'

import { ExtendedTradeRawState } from '../trade'

/**
 * Buy orders are not allowed for selling ETH
 * So we reset the state when user tries to switch tokens
 */
export const SELL_ETH_RESET_STATE: Partial<ExtendedTradeRawState> = {
  orderKind: OrderKind.SELL,
  inputCurrencyAmount: null,
  outputCurrencyAmount: null,
}
