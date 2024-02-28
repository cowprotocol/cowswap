import { ONE_FRACTION } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

interface AmountForSignatureParams {
  trade: TradeGp
  allowedSlippage: Percent
  kind: OrderKind
  featureFlags: {
    swapZeroFee: boolean | undefined
  }
}

function inputAmountForSignature(params: AmountForSignatureParams): CurrencyAmount<Currency> {
  const { trade, allowedSlippage, kind, featureFlags } = params
  const slippageCoeff = ONE_FRACTION.add(allowedSlippage)

  const isSell = isSellOrder(kind)

  if (featureFlags.swapZeroFee) {
    if (isSell) {
      return trade.inputAmount
    } else {
      return trade.inputAmountWithPartnerFee.multiply(slippageCoeff) // add slippage
    }
  }

  if (isSell) {
    return trade.inputAmountWithPartnerFee
  } else {
    return trade.inputAmountWithPartnerFee.multiply(slippageCoeff) // add slippage
  }
}

function outputAmountForSignature(params: AmountForSignatureParams): CurrencyAmount<Currency> {
  const { kind, trade, allowedSlippage, featureFlags } = params
  const slippageCoeff = ONE_FRACTION.subtract(allowedSlippage)

  if (featureFlags.swapZeroFee) {
    if (isSellOrder(kind)) {
      return trade.outputAmountWithPartnerFee.multiply(slippageCoeff) // subtract slippage
    } else {
      return trade.outputAmountWithoutFee
    }
  }

  if (trade.tradeType === TradeType.EXACT_OUTPUT) {
    return trade.outputAmountWithPartnerFee
  }

  return trade.outputAmountWithPartnerFee.multiply(slippageCoeff) // subtract slippage
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
