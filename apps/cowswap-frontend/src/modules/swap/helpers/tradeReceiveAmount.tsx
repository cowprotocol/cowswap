import { CurrencyAmount, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { ReceiveAmountInfo } from 'modules/trade/types'

export function getInputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  const inputAmountAfterFees = trade.inputAmountAfterFees.lessThan(0)
    ? CurrencyAmount.fromRawAmount(trade.inputAmountAfterFees.currency, 0)
    : trade.inputAmountAfterFees

  return {
    type: 'from',
    amountBeforeFees:
      trade.tradeType === TradeType.EXACT_INPUT && trade.inputAmountWithFee.lessThan(trade.fee.amount)
        ? undefined
        : trade.inputAmountWithoutFee,
    amountAfterFees: inputAmountAfterFees,
    partnerFeeAmount: trade.partnerFeeAmount,
    feeAmount: trade.fee.feeAsCurrency,
  }
}

export function getOutputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  const outputAmountAfterFees = trade.outputAmountAfterFees.lessThan(0)
    ? CurrencyAmount.fromRawAmount(trade.outputAmountAfterFees.currency, 0)
    : trade.outputAmountAfterFees

  return {
    type: 'to',
    amountBeforeFees: trade.outputAmountWithoutFee,
    amountAfterFees: outputAmountAfterFees,
    partnerFeeAmount: trade.partnerFeeAmount,
    feeAmount: trade.outputAmountWithoutFee?.subtract(trade.outputAmount),
  }
}
