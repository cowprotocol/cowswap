import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { TradeFormValidationContext } from '../types'

export function getIsSolanaSellUsdValueUnknown(tradeFormValidationContext: TradeFormValidationContext): boolean {
  const { derivedTradeState, isSolanaPublicLaunched } = tradeFormValidationContext
  const { inputCurrency, inputCurrencyAmount, inputCurrencyFiatAmount } = derivedTradeState

  if (isSolanaPublicLaunched) return false

  if (!inputCurrency || !isSolanaChain(inputCurrency.chainId)) return false

  // A buy order gets its sell amount from the quote; until then the quote loading/error states apply
  if (!inputCurrencyAmount) return false

  return !inputCurrencyFiatAmount
}
