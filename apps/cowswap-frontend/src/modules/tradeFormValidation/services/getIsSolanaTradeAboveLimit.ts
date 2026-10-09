import { SOLANA_ALPHA_MAX_TRADE_SIZE_USD } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { TradeFormValidationContext } from '../types'

export function getIsSolanaTradeAboveLimit(tradeFormValidationContext: TradeFormValidationContext): boolean {
  const { derivedTradeState } = tradeFormValidationContext
  const { orderKind, inputCurrency, inputCurrencyFiatAmount, outputCurrencyFiatAmount } = derivedTradeState

  if (!inputCurrency || !isSolanaChain(inputCurrency.chainId)) return false

  const fiatAmount = isSellOrder(orderKind) ? inputCurrencyFiatAmount : outputCurrencyFiatAmount

  // Fail closed: an amount that cannot be priced in USD cannot be checked against the cap,
  // so it must not trade. Wrap/unwrap always has null fiat amounts and is exempted by the caller.
  if (!fiatAmount) return true

  return Number(fiatAmount.toExact()) > SOLANA_ALPHA_MAX_TRADE_SIZE_USD
}
