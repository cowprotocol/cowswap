import { SOLANA_ALPHA_MAX_TRADE_SIZE_USD } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { TradeFormValidationContext } from '../types'

export function getIsSolanaTradeAboveLimit(tradeFormValidationContext: TradeFormValidationContext): boolean {
  const { derivedTradeState } = tradeFormValidationContext
  const { orderKind, inputCurrency, inputCurrencyFiatAmount, outputCurrencyFiatAmount } = derivedTradeState

  if (!inputCurrency || !isSolanaChain(inputCurrency.chainId)) return false

  const fiatAmount =
    (isSellOrder(orderKind) ? inputCurrencyFiatAmount : outputCurrencyFiatAmount) ?? inputCurrencyFiatAmount

  // Either getIsSolanaSellUsdValueUnknown already blocked the trade, or a buy order has no quoted sell amount yet
  if (!fiatAmount) return false

  return Number(fiatAmount.toExact()) > SOLANA_ALPHA_MAX_TRADE_SIZE_USD
}
