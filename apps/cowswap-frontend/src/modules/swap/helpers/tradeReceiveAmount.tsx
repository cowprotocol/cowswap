import { ReactNode } from 'react'

import { TokenAmount, TokenAmountProps } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

export interface ReceiveAmountInfo {
  type: 'from' | 'to'
  amountBeforeFees: ReactNode
  amountAfterFees: ReactNode
  amountAfterFeesRaw: CurrencyAmount<Currency>
  feeAmount: ReactNode
  partnerFeeAmount: ReactNode
  feeAmountRaw: TokenAmountProps['amount']
  partnerFeeAmountRaw: TokenAmountProps['amount']
}

export function getInputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  const feeAmountRaw = trade.fee.feeAsCurrency

  const inputAmountAfterFees = trade.inputAmountAfterFees.lessThan(0)
    ? CurrencyAmount.fromRawAmount(trade.inputAmountAfterFees.currency, 0)
    : trade.inputAmountAfterFees

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
    amountAfterFeesRaw: inputAmountAfterFees,
    amountAfterFees: <TokenAmount amount={inputAmountAfterFees} defaultValue="0" />,
    feeAmount: <TokenAmount amount={feeAmountRaw} defaultValue="0" />,
    partnerFeeAmount: <TokenAmount amount={trade.partnerFeeAmount} defaultValue="0" />,
    partnerFeeAmountRaw: trade.partnerFeeAmount,
    feeAmountRaw,
  }
}

export function getOutputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  const feeAmountRaw = trade.outputAmountWithoutFee?.subtract(trade.outputAmount)

  const outputAmountAfterFees = trade.outputAmountAfterFees.lessThan(0)
    ? CurrencyAmount.fromRawAmount(trade.outputAmountAfterFees.currency, 0)
    : trade.outputAmountAfterFees

  return {
    type: 'to',
    amountBeforeFees: <TokenAmount amount={trade.outputAmountWithoutFee} defaultValue="0" />,
    amountAfterFeesRaw: outputAmountAfterFees,
    amountAfterFees: <TokenAmount amount={outputAmountAfterFees} defaultValue="0" />,
    feeAmount: <TokenAmount amount={feeAmountRaw} defaultValue="0" />,
    partnerFeeAmount: <TokenAmount amount={trade.partnerFeeAmount} defaultValue="0" />,
    partnerFeeAmountRaw: trade.partnerFeeAmount,
    feeAmountRaw,
  }
}
