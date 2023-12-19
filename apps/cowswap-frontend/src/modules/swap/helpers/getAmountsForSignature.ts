import { ONE_FRACTION } from '@cowprotocol/common-const'
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
  const fee = trade.fee.feeAsCurrency
  const slippageCoeff = ONE_FRACTION.add(allowedSlippage)

  if (featureFlags.swapZeroFee) {
    if (kind === OrderKind.SELL) {
      return trade.inputAmount
    } else {
      return trade.inputAmountWithoutFee
        .multiply(slippageCoeff) // add slippage
        .add(fee) // add fee
    }
  }

  if (kind === OrderKind.SELL) {
    return trade.inputAmountWithFee
  } else {
    return trade.inputAmountWithFee.multiply(slippageCoeff) // add slippage
  }
}

function outputAmountForSignature(params: AmountForSignatureParams): CurrencyAmount<Currency> {
  const { kind, trade, allowedSlippage, featureFlags } = params
  const slippageCoeff = ONE_FRACTION.subtract(allowedSlippage)

  if (featureFlags.swapZeroFee) {
    if (kind === OrderKind.SELL) {
      const shouldRevertPrice = trade.executionPrice.quoteCurrency.equals(trade.fee.feeAsCurrency.currency)
      const price = shouldRevertPrice ? trade.executionPrice.invert() : trade.executionPrice
      const feeInOutputCurrency = price.quote(trade.fee.feeAsCurrency)

      return trade.outputAmountWithoutFee
        .multiply(slippageCoeff) // subtract slippage
        .subtract(feeInOutputCurrency) // subtract fee
    } else {
      return trade.outputAmountWithoutFee
    }
  }

  if (trade.tradeType === TradeType.EXACT_OUTPUT) {
    return trade.outputAmount
  }

  return trade.outputAmount.multiply(slippageCoeff) // subtract slippage
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
