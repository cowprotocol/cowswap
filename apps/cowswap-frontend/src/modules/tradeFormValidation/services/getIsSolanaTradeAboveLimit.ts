import { SOLANA_ALPHA_MAX_TRADE_SIZE_USD } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { TradeFormValidationContext } from '../types'

export function getIsSolanaTradeAboveLimit(tradeFormValidationContext: TradeFormValidationContext): boolean {
  const { derivedTradeState } = tradeFormValidationContext
  const { orderKind, inputCurrency, inputCurrencyFiatAmount, outputCurrencyFiatAmount } = derivedTradeState

  if (!inputCurrency || !isSolanaChain(inputCurrency.chainId)) return false

  const fiatAmount = isSellOrder(orderKind) ? inputCurrencyFiatAmount : outputCurrencyFiatAmount
  const usdAmount = fiatAmount ? Number(fiatAmount.toExact()) : null

  return usdAmount !== null && usdAmount > SOLANA_ALPHA_MAX_TRADE_SIZE_USD
}
