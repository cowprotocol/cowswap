import { useMemo } from 'react'

import { bpsToPercent, isSellOrder } from '@cowprotocol/common-utils'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useWidgetPartnerFee } from 'modules/injectedWidget'

import { useDerivedTradeState } from './useDerivedTradeState'

// import { useTradeQuote } from '../../tradeQuote'
import { ReceiveAmountInfo } from '../types'

export function useReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { state } = useDerivedTradeState()
  // const { response, isLoading } = useTradeQuote()
  const partnerFee = useWidgetPartnerFee()

  return useMemo(() => {
    const isSell = !!state?.orderKind && isSellOrder(state.orderKind)
    const amount = isSell ? state?.outputCurrencyAmount : state?.inputCurrencyAmount

    if (!amount) return null

    const type = isSell ? 'to' : 'from'

    const { amountAfterPartnerFee, partnerFeeAmount } = getAmountAfterPartnerFees(type, amount, partnerFee)

    return {
      type,
      amountBeforeFees: amount,
      amountAfterFees: amountAfterPartnerFee,
      networkFeeAmount: undefined, // TODO: add network fee from quote
      partnerFeeAmount,
    }
  }, [state, partnerFee])
}

function getAmountAfterPartnerFees(
  type: ReceiveAmountInfo['type'],
  amount: CurrencyAmount<Currency>,
  partnerFee: PartnerFee | undefined
) {
  const partnerFeeAmount = partnerFee ? amount.multiply(bpsToPercent(partnerFee.bps)) : undefined
  const amountAfterPartnerFee = partnerFeeAmount
    ? type === 'to'
      ? amount.subtract(partnerFeeAmount)
      : amount.add(partnerFeeAmount)
    : amount

  return {
    amountAfterPartnerFee,
    partnerFeeAmount,
  }
}
