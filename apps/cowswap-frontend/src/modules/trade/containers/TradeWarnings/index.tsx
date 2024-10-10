import React from 'react'

import { CowSwapSafeAppLink, InlineBanner } from '@cowprotocol/ui'
import { useIsSafeViaWc } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useShouldZeroApprove } from 'modules/zeroApproval'

import { useReceiveAmountInfo } from '../../hooks/useReceiveAmountInfo'
import { ZeroApprovalWarning } from '../../pure/ZeroApprovalWarning'
import { NoImpactWarning } from '../NoImpactWarning'

export function TradeWarnings() {
  const { banners: widgetBanners } = useInjectedWidgetParams()
  const primaryFormValidation = useGetTradeFormValidation()
  const receiveAmountInfo = useReceiveAmountInfo()
  const inputAmountWithSlippage = receiveAmountInfo?.afterSlippage.sellAmount
  const shouldZeroApprove = useShouldZeroApprove(inputAmountWithSlippage)
  const isSafeViaWc = useIsSafeViaWc()

  const showBundleTxApprovalBanner = primaryFormValidation === TradeFormValidation.ApproveAndSwap
  const showSafeWcBundlingBanner =
    isSafeViaWc && primaryFormValidation === TradeFormValidation.ApproveRequired && !widgetBanners?.hideSafeWebAppBanner

  return (
    <>
      {shouldZeroApprove && <ZeroApprovalWarning currency={inputAmountWithSlippage?.currency} />}
      <NoImpactWarning />
      {showBundleTxApprovalBanner && <BundleTxApprovalBanner />}
      {showSafeWcBundlingBanner && <BundleTxSafeWcBanner />}
    </>
  )
}

function BundleTxApprovalBanner() {
  return (
    <InlineBanner bannerType="information" iconSize={32}>
      <strong>Token approval bundling</strong>
      <p>
        For your convenience, token approval and order placement will be bundled into a single transaction, streamlining
        your experience!
      </p>
    </InlineBanner>
  )
}

function BundleTxSafeWcBanner() {
  return (
    <InlineBanner bannerType="information" iconSize={32}>
      <strong>Use Safe web app</strong>
      <p>
        Use the Safe web app for streamlined trading: token approval and orders bundled in one go! Only available in the{' '}
        <CowSwapSafeAppLink />
      </p>
    </InlineBanner>
  )
}
