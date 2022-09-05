import { TradeType } from '@uniswap/sdk-core'
import { formatSmartAmount } from 'utils/format'
import TradeGp from 'state/swap/TradeGp'

export interface ReceiveAmountInfo {
  type: 'from' | 'to'
  amountBeforeFees: string
  amountAfterFees: string
  feeAmount: string
}

export function getInputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  return {
    type: 'from',
    // TODO: why we don't check the same for OUTPUT currency?
    amountBeforeFees:
      trade.tradeType === TradeType.EXACT_INPUT && trade.inputAmountWithFee.lessThan(trade.fee.amount)
        ? '0'
        : formatSmartAmount(trade.inputAmountWithoutFee) || '0',
    amountAfterFees: formatSmartAmount(trade.inputAmountWithFee) || '0',
    feeAmount: formatSmartAmount(trade.fee.feeAsCurrency) || '0',
  }
}

export function getOutputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  return {
    type: 'to',
    amountBeforeFees: formatSmartAmount(trade.outputAmountWithoutFee) || '0',
    amountAfterFees: formatSmartAmount(trade.outputAmount) || '0',
    feeAmount: formatSmartAmount(trade.outputAmountWithoutFee?.subtract(trade.outputAmount)) || '0',
  }
}
