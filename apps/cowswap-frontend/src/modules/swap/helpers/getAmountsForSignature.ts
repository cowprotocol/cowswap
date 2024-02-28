import { ONE_FRACTION } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

interface AmountForSignatureParams {
  trade: TradeGp
  allowedSlippage: Percent
  kind: OrderKind
}

function inputAmountForSignature(params: AmountForSignatureParams): CurrencyAmount<Currency> {
  const { trade, allowedSlippage, kind } = params
  const slippageCoeff = ONE_FRACTION.add(allowedSlippage)

  const isSell = isSellOrder(kind)

  if (isSell) {
    return trade.inputAmount
  } else {
    return trade.inputAmountWithPartnerFee.multiply(slippageCoeff) // add slippage
  }
}

function outputAmountForSignature(params: AmountForSignatureParams): CurrencyAmount<Currency> {
  const { kind, trade, allowedSlippage } = params
  const slippageCoeff = ONE_FRACTION.subtract(allowedSlippage)

  if (isSellOrder(kind)) {
    return trade.outputAmountWithPartnerFee.multiply(slippageCoeff) // subtract slippage
  } else {
    return trade.outputAmountWithoutFee
  }
}

export interface AmountsForSignature {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
}

export function getAmountsForSignature(params: AmountForSignatureParams): AmountsForSignature {
  const inputAmount = inputAmountForSignature(params)
  const outputAmount = outputAmountForSignature(params)

  return { inputAmount, outputAmount }
}
