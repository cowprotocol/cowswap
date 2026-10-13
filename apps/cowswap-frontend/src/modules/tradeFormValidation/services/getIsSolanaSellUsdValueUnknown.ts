import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { TradeFormValidationContext } from '../types'

export function getIsSolanaSellUsdValueUnknown(tradeFormValidationContext: TradeFormValidationContext): boolean {
  const { inputCurrency, inputCurrencyFiatAmount } = tradeFormValidationContext.derivedTradeState

  if (!inputCurrency || !isSolanaChain(inputCurrency.chainId)) return false

  return !inputCurrencyFiatAmount
}
