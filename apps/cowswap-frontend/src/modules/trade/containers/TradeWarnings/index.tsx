import React, { ReactNode } from 'react'

import { HighSuggestedSlippageWarning } from 'modules/tradeSlippage'

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
  const inputAmountWithSlippage = receiveAmountInfo?.amountsToSign.sellAmount
  const shouldZeroApprove = useShouldShowZeroApproveWarning(inputAmountWithSlippage)

  return (
    <>
      {shouldZeroApprove && <ZeroApprovalWarning currency={inputAmountWithSlippage?.currency} />}
      <NoImpactWarning />
      {enableSmartSlippage && <HighSuggestedSlippageWarning isTradePriceUpdating={isTradePriceUpdating} />}
    </>
  )
}
