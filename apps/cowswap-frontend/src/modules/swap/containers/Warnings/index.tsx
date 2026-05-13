import React, { ReactNode, useEffect } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import {
  useIsCurrentTradeBridging,
  useIsNonEvmBridging,
  useNonEvmReceiverConfirmed,
  useSetNonEvmReceiverConfirmed,
  useTradePriceImpact,
  useTradeRouteContext,
} from 'modules/trade'
import { HighFeeWarning, MetamaskTransactionWarning, SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import { useShouldCheckBridgingRecipient } from '../../hooks/useSmartContractRecipientConfirmed'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { SwapFormState, useSwapFormState } from '../../hooks/useSwapFormState'
import { SmartContractReceiverWarning } from '../../pure/SmartContractReceiverWarning'
import { TwapSuggestionBanner } from '../../pure/TwapSuggestionBanner'

interface WarningsProps {
  buyingFiatAmount: CurrencyAmount<Currency> | null
  hideQuoteAmount: boolean
}

export function Warnings({ buyingFiatAmount, hideQuoteAmount }: WarningsProps): ReactNode {
  const { chainId, account } = useWalletInfo()
  const { inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount, recipient } = useSwapDerivedState()
  const formState = useSwapFormState()
  const tradeUrlParams = useTradeRouteContext()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const isNonEvmBridging = useIsNonEvmBridging()
  const shouldCheckBridgingRecipient = useShouldCheckBridgingRecipient()
  const nonEvmReceiverConfirmed = useNonEvmReceiverConfirmed()
  const setNonEvmReceiverConfirmed = useSetNonEvmReceiverConfirmed()
  const outputChainId = outputCurrency?.chainId

  const isNativeSellInHooksStore = formState === SwapFormState.SellNativeInHooks

  const priceImpactParams = useTradePriceImpact()
  const widgetParams = useInjectedWidgetParams()

  const { enabledTradeTypes } = widgetParams
  const showTwapSuggestionBanner =
    (!enabledTradeTypes || enabledTradeTypes.includes(TradeType.ADVANCED)) && !isCurrentTradeBridging

  // Reset confirmation when trade params change
  useEffect(() => {
    if (!outputChainId) return

    setNonEvmReceiverConfirmed(false)
  }, [recipient, chainId, account, outputChainId, setNonEvmReceiverConfirmed])

  // Show SC wallet warning only when recipient was NOT explicitly set by the user
  // (i.e. the connected wallet address will be used as the recipient on another chain)
  // For non-EVM chains the EVM wallet address is not a valid fallback,
  // so there is nothing to warn about — the "Recipient is required" validation handles that case.
  const showScWalletWarning =
    shouldCheckBridgingRecipient &&
    !recipient &&
    !isNonEvmBridging &&
    !!account &&
    !!outputChainId &&
    !isFractionFalsy(outputCurrencyAmount)

  return (
    <>
      {inputCurrency && !isNativeSellInHooksStore && <MetamaskTransactionWarning sellToken={inputCurrency} />}
      {isNativeSellInHooksStore && <SellNativeWarningBanner />}
      {!hideQuoteAmount && <HighFeeWarning />}
      {showScWalletWarning && (
        <SmartContractReceiverWarning
          account={account}
          recipient={recipient}
          chainId={outputChainId}
          checked={nonEvmReceiverConfirmed}
          toggle={setNonEvmReceiverConfirmed}
        />
      )}
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
