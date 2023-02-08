import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { ReactNode } from 'react'

export interface ReceiveAmountInfo {
  type: 'from' | 'to'
  amountBeforeFees: ReactNode
  amountAfterFees: ReactNode
  amountAfterFeesRaw: CurrencyAmount<Currency>
  feeAmount: ReactNode
}

export function getInputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  return {
    type: 'from',
    amountBeforeFees: (
      <TokenAmount
        amount={
          trade.tradeType === TradeType.EXACT_INPUT && trade.inputAmountWithFee.lessThan(trade.fee.amount)
            ? null
            : trade.inputAmountWithoutFee
        }
        defaultValue="0"
      />
    ),
    amountAfterFeesRaw: trade.inputAmountWithFee,
    amountAfterFees: <TokenAmount amount={trade.inputAmountWithFee} defaultValue="0" />,
    feeAmount: <TokenAmount amount={trade.fee.feeAsCurrency} defaultValue="0" />,
  }
}

export function getOutputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  return {
    type: 'to',
    amountBeforeFees: <TokenAmount amount={trade.outputAmountWithoutFee} defaultValue="0" />,
    amountAfterFeesRaw: trade.outputAmount,
    amountAfterFees: <TokenAmount amount={trade.outputAmount} defaultValue="0" />,
    feeAmount: <TokenAmount amount={trade.outputAmountWithoutFee?.subtract(trade.outputAmount)} defaultValue="0" />,
  }
}
