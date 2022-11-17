import { HighFeeWarning, NoImpactWarning } from 'components/SwapWarnings'

import { CompatibilityIssuesWarning } from '@cow/modules/swap/pure/CompatibilityIssuesWarning'
import TradeGp from 'state/swap/TradeGp'
import { Currency } from '@uniswap/sdk-core'
import React from 'react'
import { genericPropsChecker } from '@cow/modules/swap/containers/NewSwapWidget/propsChecker'

export interface NewSwapWarningsTopProps {
  trade: TradeGp | undefined
  account: string | undefined
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  hideUnknownImpactWarning: boolean
  isExpertMode: boolean
  setFeeWarningAccepted(cb: (state: boolean) => boolean): void
  setImpactWarningAccepted(cb: (state: boolean) => boolean): void
}

export interface NewSwapWarningsBottomProps {
  isSupportedWallet: boolean
  swapIsUnsupported: boolean
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
}

export const NewSwapWarningsTop = React.memo(function (props: NewSwapWarningsTopProps) {
  const {
    trade,
    account,
    feeWarningAccepted,
    impactWarningAccepted,
    isExpertMode,
    hideUnknownImpactWarning,
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
        width="99%"
        padding="5px 15px"
      />
      <NoImpactWarning
        trade={trade}
        hide={hideUnknownImpactWarning}
        acceptedStatus={impactWarningAccepted}
        acceptWarningCb={!isExpertMode && account ? () => setImpactWarningAccepted((state) => !state) : undefined}
        width="99%"
        padding="5px 15px"
      />
    </>
  )
}, genericPropsChecker)

export const NewSwapWarningsBottom = React.memo(function (props: NewSwapWarningsBottomProps) {
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
