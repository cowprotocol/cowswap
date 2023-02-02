import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { formatSmartAmount } from '@cow/utils/format'
import TradeGp from 'state/swap/TradeGp'

export interface ReceiveAmountInfo {
  type: 'from' | 'to'
  amountBeforeFees: string
  amountAfterFees: string
  amountAfterFeesRaw: CurrencyAmount<Currency>
  feeAmount: string
}

export function getInputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  return {
    type: 'from',
    amountBeforeFees:
      trade.tradeType === TradeType.EXACT_INPUT && trade.inputAmountWithFee.lessThan(trade.fee.amount)
        ? '0'
        : formatSmartAmount(trade.inputAmountWithoutFee) || '0',
    amountAfterFeesRaw: trade.inputAmountWithFee,
    amountAfterFees: formatSmartAmount(trade.inputAmountWithFee) || '0',
    feeAmount: formatSmartAmount(trade.fee.feeAsCurrency) || '0',
  }
}

export function getOutputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  return {
    type: 'to',
    amountBeforeFees: formatSmartAmount(trade.outputAmountWithoutFee) || '0',
    amountAfterFeesRaw: trade.outputAmount,
    amountAfterFees: formatSmartAmount(trade.outputAmount) || '0',
    feeAmount: formatSmartAmount(trade.outputAmountWithoutFee?.subtract(trade.outputAmount)) || '0',
  }
}
