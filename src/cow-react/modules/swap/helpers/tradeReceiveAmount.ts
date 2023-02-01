import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { tokenViewAmount } from '@cow/modules/trade/utils/tokenViewAmount'

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
        : tokenViewAmount(trade.inputAmountWithoutFee) || '0',
    amountAfterFeesRaw: trade.inputAmountWithFee,
    amountAfterFees: tokenViewAmount(trade.inputAmountWithFee) || '0',
    feeAmount: tokenViewAmount(trade.fee.feeAsCurrency) || '0',
  }
}

export function getOutputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  return {
    type: 'to',
    amountBeforeFees: tokenViewAmount(trade.outputAmountWithoutFee) || '0',
    amountAfterFeesRaw: trade.outputAmount,
    amountAfterFees: tokenViewAmount(trade.outputAmount) || '0',
    feeAmount: tokenViewAmount(trade.outputAmountWithoutFee?.subtract(trade.outputAmount)) || '0',
  }
}
