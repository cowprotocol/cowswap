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
    amountAfterFeesRaw: trade.inputAmountWithPartnerFee,
    amountAfterFees: <TokenAmount amount={trade.inputAmountWithPartnerFee} defaultValue="0" />,
    feeAmount: <TokenAmount amount={feeAmountRaw} defaultValue="0" />,
    partnerFeeAmount: <TokenAmount amount={trade.partnerFeeAmount} defaultValue="0" />,
    partnerFeeAmountRaw: trade.partnerFeeAmount,
    feeAmountRaw,
  }
}

export function getOutputReceiveAmountInfo(trade: TradeGp): ReceiveAmountInfo {
  const feeAmountRaw = trade.outputAmountWithoutFee?.subtract(trade.outputAmount)
  return {
    type: 'to',
    amountBeforeFees: <TokenAmount amount={trade.outputAmountWithoutFee} defaultValue="0" />,
    amountAfterFeesRaw: trade.outputAmountWithPartnerFee,
    amountAfterFees: <TokenAmount amount={trade.outputAmountWithPartnerFee} defaultValue="0" />,
    feeAmount: <TokenAmount amount={feeAmountRaw} defaultValue="0" />,
    partnerFeeAmount: <TokenAmount amount={trade.partnerFeeAmount} defaultValue="0" />,
    partnerFeeAmountRaw: trade.partnerFeeAmount,
    feeAmountRaw,
  }
}
