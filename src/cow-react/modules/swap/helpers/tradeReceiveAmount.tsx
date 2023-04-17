import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { TokenAmount, TokenAmountProps } from '@cow/common/pure/TokenAmount'
import { ReactNode } from 'react'

export interface ReceiveAmountInfo {
  type: 'from' | 'to'
  amountBeforeFees: ReactNode
  amountAfterFees: ReactNode
  amountAfterFeesRaw: CurrencyAmount<Currency>
  feeAmount: ReactNode
  feeAmountRaw: TokenAmountProps['amount']
}

export function getInputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  const feeAmountRaw = trade.fee.feeAsCurrency

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
    feeAmount: <TokenAmount amount={feeAmountRaw} defaultValue="0" />,
    feeAmountRaw,
  }
}

export function getOutputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  const feeAmountRaw = trade.outputAmountWithoutFee?.subtract(trade.outputAmount)
  return {
    type: 'to',
    amountBeforeFees: <TokenAmount amount={trade.outputAmountWithoutFee} defaultValue="0" />,
    amountAfterFeesRaw: trade.outputAmount,
    amountAfterFees: <TokenAmount amount={trade.outputAmount} defaultValue="0" />,
    feeAmount: <TokenAmount amount={feeAmountRaw} defaultValue="0" />,
    feeAmountRaw,
  }
}
