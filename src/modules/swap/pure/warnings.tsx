import React from 'react'

import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { HighFeeWarning } from 'legacy/components/SwapWarnings'
import TradeGp from 'legacy/state/swap/TradeGp'

import { CompatibilityIssuesWarning } from 'modules/trade/pure/CompatibilityIssuesWarning'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'

import { BundleTxApprovalBanner, BundleTxSafeWcBanner, BundleTxWrapBanner } from 'common/pure/InlineBanner/banners'
import { ZeroApprovalWarning } from 'common/pure/ZeroApprovalWarning'
import { genericPropsChecker } from 'utils/genericPropsChecker'

export interface SwapWarningsTopProps {
  trade: TradeGp | undefined
  account: string | undefined
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  hideUnknownImpactWarning: boolean
  isExpertMode: boolean
  showApprovalBundlingBanner: boolean
  showWrapBundlingBanner: boolean
  shouldZeroApprove: boolean
  showSafeWcBundlingBanner: boolean
  nativeCurrencySymbol: string
  setFeeWarningAccepted(cb: (state: boolean) => boolean): void
  setImpactWarningAccepted(cb: (state: boolean) => boolean): void
}

export interface SwapWarningsBottomProps {
  isSupportedWallet: boolean
  swapIsUnsupported: boolean
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
}

const StyledNoImpactWarning = styled(NoImpactWarning)`
  margin-bottom: 15px;
`

export const SwapWarningsTop = React.memo(function (props: SwapWarningsTopProps) {
  const {
    trade,
    account,
    feeWarningAccepted,
    impactWarningAccepted,
    isExpertMode,
    hideUnknownImpactWarning,
    showApprovalBundlingBanner,
    showWrapBundlingBanner,
    showSafeWcBundlingBanner,
    nativeCurrencySymbol,
    setFeeWarningAccepted,
    setImpactWarningAccepted,
    shouldZeroApprove,
  } = props

  console.debug('SWAP WARNING RENDER TOP: ', props)

  return (
    <>
      {shouldZeroApprove && <ZeroApprovalWarning currency={trade?.inputAmount.currency} />}
      <HighFeeWarning
        trade={trade}
        acceptedStatus={feeWarningAccepted}
        acceptWarningCb={!isExpertMode && account ? () => setFeeWarningAccepted((state) => !state) : undefined}
      />
      {!hideUnknownImpactWarning && (
        <StyledNoImpactWarning
          isAccepted={impactWarningAccepted}
          acceptCallback={!isExpertMode && account ? () => setImpactWarningAccepted((state) => !state) : undefined}
        />
      )}
      {showApprovalBundlingBanner && <BundleTxApprovalBanner />}
      {showWrapBundlingBanner && <BundleTxWrapBanner />}
      {showSafeWcBundlingBanner && (
        <BundleTxSafeWcBanner nativeCurrencySymbol={nativeCurrencySymbol} supportsWrapping />
      )}
    </>
  )
}, genericPropsChecker)

export const SwapWarningsBottom = React.memo(function (props: SwapWarningsBottomProps) {
  const { isSupportedWallet, swapIsUnsupported, currencyIn, currencyOut } = props

  console.debug('SWAP WARNING RENDER BOTTOM: ', props)

  return (
    <>
      {currencyIn && currencyOut && swapIsUnsupported && (
        <CompatibilityIssuesWarning
          currencyIn={currencyIn}
          currencyOut={currencyOut}
          isSupportedWallet={isSupportedWallet}
        />
      )}
    </>
  )
}, genericPropsChecker)
