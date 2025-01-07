import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { SellNativeWarningBanner } from 'modules/trade/containers/SellNativeWarningBanner'
import { CompatibilityIssuesWarning } from 'modules/trade/pure/CompatibilityIssuesWarning'
import { TradeUrlParams } from 'modules/trade/types/TradeRawState'
import { BundleTxWrapBanner, HighFeeWarning } from 'modules/tradeWidgetAddons'

import { PartialApprovalBanner } from './banners/PartialApprovalBanner'
import { TwapSuggestionBanner } from './banners/TwapSuggestionBanner'

export interface SwapWarningsTopProps {
  chainId: SupportedChainId
  trade: TradeGp | undefined
  showTwapSuggestionBanner: boolean
  buyingFiatAmount: CurrencyAmount<Currency> | null
  priceImpact: Percent | undefined
  tradeUrlParams: TradeUrlParams
  isNativeSellInHooksStore: boolean
  isApprovalNeeded: boolean
  openSettings: Command
}

export interface SwapWarningsBottomProps {
  isSupportedWallet: boolean
  swapIsUnsupported: boolean
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
}

export const SwapWarningsTop = React.memo(function (props: SwapWarningsTopProps) {
  const {
    chainId,
    trade,
    showTwapSuggestionBanner,
    buyingFiatAmount,
    priceImpact,
    tradeUrlParams,
    isNativeSellInHooksStore,
    isApprovalNeeded,
    openSettings
  } = props

  return (
    <>
      {isNativeSellInHooksStore ? (
        <SellNativeWarningBanner />
      ) : (
        <>
          <HighFeeWarning />
          <BundleTxWrapBanner />
          <PartialApprovalBanner isApprovalNeeded={isApprovalNeeded} openSettings={openSettings} />

          {showTwapSuggestionBanner && (
            <TwapSuggestionBanner
              chainId={chainId}
              priceImpact={priceImpact}
              buyingFiatAmount={buyingFiatAmount}
              tradeUrlParams={tradeUrlParams}
              sellAmount={trade?.inputAmount.toExact()}
            />
          )}
        </>
      )}
    </>
  )
}, genericPropsChecker)

export const SwapWarningsBottom = React.memo(function (props: SwapWarningsBottomProps) {
  const { isSupportedWallet, swapIsUnsupported, currencyIn, currencyOut } = props

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
