import React, { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useIsCurrentTradeBridging, useTradePriceImpact, useTradeRouteContext } from 'modules/trade'
import { HighFeeWarning, MetamaskTransactionWarning, SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { SwapFormState, useSwapFormState } from '../../hooks/useSwapFormState'
import { TwapSuggestionBanner } from '../../pure/TwapSuggestionBanner'

interface WarningsProps {
  buyingFiatAmount: CurrencyAmount<Currency> | null
  hideQuoteAmount: boolean
}

export function Warnings({ buyingFiatAmount, hideQuoteAmount }: WarningsProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { inputCurrency, inputCurrencyAmount } = useSwapDerivedState()
  const formState = useSwapFormState()
  const tradeUrlParams = useTradeRouteContext()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  const isNativeSellInHooksStore = formState === SwapFormState.SellNativeInHooks

  const priceImpactParams = useTradePriceImpact()
  const widgetParams = useInjectedWidgetParams()

  const { enabledTradeTypes } = widgetParams
  const showTwapSuggestionBanner =
    (!enabledTradeTypes || enabledTradeTypes.includes(TradeType.ADVANCED)) && !isCurrentTradeBridging

  return (
    <>
      {inputCurrency && !isNativeSellInHooksStore && <MetamaskTransactionWarning sellToken={inputCurrency} />}
      {isNativeSellInHooksStore && <SellNativeWarningBanner />}
      {!hideQuoteAmount && <HighFeeWarning />}
      {showTwapSuggestionBanner && (
        <TwapSuggestionBanner
          chainId={chainId}
          priceImpact={priceImpactParams.priceImpact}
          buyingFiatAmount={buyingFiatAmount}
          tradeUrlParams={tradeUrlParams}
          sellAmount={inputCurrencyAmount}
        />
      )}
    </>
  )
}
