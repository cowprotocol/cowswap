import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { TradeFormValidationContext } from '../types'

export function getIsSolanaSellUsdValueUnknown(tradeFormValidationContext: TradeFormValidationContext): boolean {
  const { inputCurrency, inputCurrencyAmount, inputCurrencyFiatAmount } = tradeFormValidationContext.derivedTradeState

  if (!inputCurrency || !isSolanaChain(inputCurrency.chainId)) return false

  // A buy order gets its sell amount from the quote; until then the quote loading/error states apply
  if (!inputCurrencyAmount) return false

  return !inputCurrencyFiatAmount
}
