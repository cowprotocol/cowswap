import { isSellOrder } from '@cowprotocol/common-utils'

import { XSTOCK_MIN_TRADE_SIZE_USD } from '../consts'
import { TradeFormValidationContext } from '../types'

export function getIsXstockTradeBelowLimit(
  tradeFormValidationContext: TradeFormValidationContext,
  multiplier = 1,
): boolean {
  const { isInputCurrencyXstock, isOutputCurrencyXstock, derivedTradeState } = tradeFormValidationContext
  const { orderKind, inputCurrencyFiatAmount, outputCurrencyFiatAmount } = derivedTradeState

  const inputAmountUsd = inputCurrencyFiatAmount ? Number(inputCurrencyFiatAmount.toExact()) : null
  const outputAmountUsd = outputCurrencyFiatAmount ? Number(outputCurrencyFiatAmount.toExact()) : null

  const hasXstockToken = isInputCurrencyXstock || isOutputCurrencyXstock
  const xstockTradeUsdAmount = isSellOrder(orderKind) ? inputAmountUsd : outputAmountUsd

  return (
    hasXstockToken && xstockTradeUsdAmount !== null && xstockTradeUsdAmount < XSTOCK_MIN_TRADE_SIZE_USD * multiplier
  )
}
