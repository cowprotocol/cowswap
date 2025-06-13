import React from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useTradePriceImpact, useTradeRouteContext } from 'modules/trade'
import { BundleTxWrapBanner, HighFeeWarning, MetamaskTransactionWarning } from 'modules/tradeWidgetAddons'
import { SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { SwapFormState, useSwapFormState } from '../../hooks/useSwapFormState'
import { TwapSuggestionBanner } from '../../pure/TwapSuggestionBanner'

interface WarningsProps {
  buyingFiatAmount: CurrencyAmount<Currency> | null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Warnings({ buyingFiatAmount }: WarningsProps) {
  const { chainId } = useWalletInfo()
  const { inputCurrency, inputCurrencyAmount } = useSwapDerivedState()
  const formState = useSwapFormState()
  const tradeUrlParams = useTradeRouteContext()
  const isNativeSellInHooksStore = formState === SwapFormState.SellNativeInHooks

  const priceImpactParams = useTradePriceImpact()
  const widgetParams = useInjectedWidgetParams()
  const { enabledTradeTypes } = widgetParams
  const showTwapSuggestionBanner = !enabledTradeTypes || enabledTradeTypes.includes(TradeType.ADVANCED)

  return (
    <>
      {inputCurrency && !isNativeSellInHooksStore && <MetamaskTransactionWarning sellToken={inputCurrency} />}
      {isNativeSellInHooksStore && <SellNativeWarningBanner />}
      <HighFeeWarning />
      <BundleTxWrapBanner />
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
