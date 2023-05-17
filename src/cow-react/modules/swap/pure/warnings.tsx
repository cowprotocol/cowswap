import { HighFeeWarning } from 'components/SwapWarnings'
import { CompatibilityIssuesWarning } from '@cow/modules/trade/pure/CompatibilityIssuesWarning'
import TradeGp from 'state/swap/TradeGp'
import { Currency } from '@uniswap/sdk-core'
import React from 'react'
import { genericPropsChecker } from '@cow/utils/genericPropsChecker'
import { NoImpactWarning } from '@cow/modules/trade/pure/NoImpactWarning'
import styled from 'styled-components/macro'
import { BundleTxApprovalBanner } from '@cow/common/pure/WarningBanner/banners'

export interface SwapWarningsTopProps {
  trade: TradeGp | undefined
  account: string | undefined
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  hideUnknownImpactWarning: boolean
  isExpertMode: boolean
  showApprovalBundlingBanner: boolean
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
    setFeeWarningAccepted,
    setImpactWarningAccepted,
  } = props

  console.debug('SWAP WARNING RENDER TOP: ', props)

  return (
    <>
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
