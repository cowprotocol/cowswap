import React from 'react'

import { genericPropsChecker } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BundleTxApprovalBanner, BundleTxSafeWcBanner, BundleTxWrapBanner } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { CompatibilityIssuesWarning } from 'modules/trade/pure/CompatibilityIssuesWarning'
import { TradeUrlParams } from 'modules/trade/types/TradeRawState'
import { HighFeeWarning } from 'modules/tradeWidgetAddons'

import { TwapSuggestionBanner } from './banners/TwapSuggestionBanner'

export interface SwapWarningsTopProps {
  chainId: SupportedChainId
  trade: TradeGp | undefined
  showApprovalBundlingBanner: boolean
  showWrapBundlingBanner: boolean
  showSafeWcBundlingBanner: boolean
  showTwapSuggestionBanner: boolean
  nativeCurrencySymbol: string
  wrappedCurrencySymbol: string
  buyingFiatAmount: CurrencyAmount<Currency> | null
  priceImpact: Percent | undefined
  tradeUrlParams: TradeUrlParams
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
    showApprovalBundlingBanner,
    showWrapBundlingBanner,
    showSafeWcBundlingBanner,
    showTwapSuggestionBanner,
    nativeCurrencySymbol,
    wrappedCurrencySymbol,
    buyingFiatAmount,
    priceImpact,
    tradeUrlParams,
  } = props

  return (
    <>
      <HighFeeWarning />
      {showApprovalBundlingBanner && <BundleTxApprovalBanner />}
      {showWrapBundlingBanner && (
        <BundleTxWrapBanner nativeCurrencySymbol={nativeCurrencySymbol} wrappedCurrencySymbol={wrappedCurrencySymbol} />
      )}
      {showSafeWcBundlingBanner && (
        <BundleTxSafeWcBanner nativeCurrencySymbol={nativeCurrencySymbol} supportsWrapping />
      )}

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
