import React, { ReactNode } from 'react'

import { InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
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
  const primaryFormValidation = useGetTradeFormValidation()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const inputAmountWithSlippage = receiveAmountInfo?.afterSlippage.sellAmount
  const shouldZeroApprove = useShouldShowZeroApproveWarning(inputAmountWithSlippage)

  const showBundleTxApprovalBanner = primaryFormValidation === TradeFormValidation.ApproveAndSwapInBundle

  return (
    <>
      {shouldZeroApprove && <ZeroApprovalWarning currency={inputAmountWithSlippage?.currency} />}
      <NoImpactWarning />
      {showBundleTxApprovalBanner && <BundleTxApprovalBanner />}
      {enableSmartSlippage && <HighSuggestedSlippageWarning isTradePriceUpdating={isTradePriceUpdating} />}
    </>
  )
}

function BundleTxApprovalBanner(): ReactNode {
  return (
    <InlineBanner bannerType={StatusColorVariant.Info} iconSize={32}>
      <strong>Token approval bundling</strong>
      <p>
        For your convenience, token approval and order placement will be bundled into a single transaction, streamlining
        your experience!
      </p>
    </InlineBanner>
  )
}
