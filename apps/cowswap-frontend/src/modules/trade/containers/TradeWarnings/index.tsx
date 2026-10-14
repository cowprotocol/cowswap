import React, { ReactNode, useMemo } from 'react'

import { SolanaAlphaBanner } from 'modules/solanaAlpha'
import { TradeFormValidation, useGetTradeFormValidations } from 'modules/tradeFormValidation'
import { HighSuggestedSlippageWarning } from 'modules/tradeSlippage'

import { TradeType } from 'common/modules/tradeNavigation'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { useGetReceiveAmountInfo } from '../../hooks/useGetReceiveAmountInfo'
import { useShouldShowZeroApproveWarning } from '../../hooks/useShouldShowZeroApproveWarning'
import { ZeroApprovalWarning } from '../../pure/ZeroApprovalWarning'
import { NoImpactWarning } from '../NoImpactWarning'

interface TradeWarningsProps {
  isTradePriceUpdating: boolean
  enableSmartSlippage?: boolean
}

export function TradeWarnings({ isTradePriceUpdating, enableSmartSlippage }: TradeWarningsProps): ReactNode {
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { inputCurrencyAmount, tradeType } = useDerivedTradeState() || {}
  const amountsToSignSellAmount = receiveAmountInfo?.amountsToSign.sellAmount
  // TWAP quotes are per-part; the zero-approve warning must use the full form sell amount.
  const amountForZeroApproveWarning = useMemo(() => {
    if (tradeType === TradeType.ADVANCED_ORDERS) {
      return inputCurrencyAmount ?? undefined
    }

    return amountsToSignSellAmount
  }, [tradeType, inputCurrencyAmount, amountsToSignSellAmount])
  const shouldZeroApprove = useShouldShowZeroApproveWarning(amountForZeroApproveWarning)
  const validations = useGetTradeFormValidations()
  const hasInsufficientBalance = !!validations?.includes(TradeFormValidation.BalanceInsufficient)

  return (
    <>
      <SolanaAlphaBanner />
      {shouldZeroApprove && !hasInsufficientBalance && (
        <ZeroApprovalWarning currency={amountForZeroApproveWarning?.currency} />
      )}
      <NoImpactWarning />
      {enableSmartSlippage && <HighSuggestedSlippageWarning isTradePriceUpdating={isTradePriceUpdating} />}
    </>
  )
}
