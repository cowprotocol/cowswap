import React, { ReactNode, useEffect } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useIsCurrentTradeBridging, useTradePriceImpact, useTradeRouteContext } from 'modules/trade'
import { HighFeeWarning, MetamaskTransactionWarning } from 'modules/tradeWidgetAddons'
import { SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import { useShouldBlockUnsupportedDestination } from '../../hooks/useShouldBlockUnsupportedDestination'
import {
  useShouldCheckBridgingRecipient,
  useSmartContractRecipientConfirmed,
  useToggleSmartContractRecipientConfirmed,
} from '../../hooks/useSmartContractRecipientConfirmed'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { SwapFormState, useSwapFormState } from '../../hooks/useSwapFormState'
import { SmartContractReceiverWarning } from '../../pure/SmartContractReceiverWarning'
import { TwapSuggestionBanner } from '../../pure/TwapSuggestionBanner'
import { UnsupportedDestinationWarning } from '../../pure/UnsupportedDestinationWarning'

interface WarningsProps {
  buyingFiatAmount: CurrencyAmount<Currency> | null
  hideQuoteAmount: boolean
  onEnableCustomRecipient: () => void
}

export function Warnings({ buyingFiatAmount, hideQuoteAmount, onEnableCustomRecipient }: WarningsProps): ReactNode {
  const { chainId, account } = useWalletInfo()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, recipient } = useSwapDerivedState()
  // Used by both Warnings (banner visibility) and TradeButtons (isDisabled). Keep in sync.
  const shouldBlockUnsupportedDestination = useShouldBlockUnsupportedDestination()
  const formState = useSwapFormState()
  const tradeUrlParams = useTradeRouteContext()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const toggleSmartContractRecipientConfirmed = useToggleSmartContractRecipientConfirmed()
  const smartContractRecipientConfirmed = useSmartContractRecipientConfirmed()
  const shouldCheckBridgingRecipient = useShouldCheckBridgingRecipient()
  const outputChainId = outputCurrency?.chainId

  const isNativeSellInHooksStore = formState === SwapFormState.SellNativeInHooks

  const priceImpactParams = useTradePriceImpact()
  const widgetParams = useInjectedWidgetParams()

  const { enabledTradeTypes } = widgetParams
  const showTwapSuggestionBanner =
    (!enabledTradeTypes || enabledTradeTypes.includes(TradeType.ADVANCED)) && !isCurrentTradeBridging

  const showSmartContractRecipientWarning =
    shouldCheckBridgingRecipient && !!account && !!outputChainId && !isFractionFalsy(outputCurrencyAmount)

  // Reset SmartContractRecipientConfirmed when trade params are changed
  useEffect(() => {
    if (!outputChainId) return

    toggleSmartContractRecipientConfirmed(false)
  }, [recipient, chainId, account, outputChainId, toggleSmartContractRecipientConfirmed])

  return (
    <>
      {inputCurrency && !isNativeSellInHooksStore && <MetamaskTransactionWarning sellToken={inputCurrency} />}
      {isNativeSellInHooksStore && <SellNativeWarningBanner />}
      {!hideQuoteAmount && <HighFeeWarning />}
      {/* Hard block (unsupported dest) takes precedence over soft check (bridging recipient) */}
      {shouldBlockUnsupportedDestination && outputChainId ? (
        <UnsupportedDestinationWarning
          destinationChainId={outputChainId}
          onEnableCustomRecipient={onEnableCustomRecipient}
        />
      ) : showSmartContractRecipientWarning ? (
        <SmartContractReceiverWarning
          account={account!}
          recipient={recipient}
          chainId={outputChainId!}
          checked={smartContractRecipientConfirmed}
          toggle={toggleSmartContractRecipientConfirmed}
        />
      ) : null}
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
