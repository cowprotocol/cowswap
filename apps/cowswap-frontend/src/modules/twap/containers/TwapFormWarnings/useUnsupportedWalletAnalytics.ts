import { useEffect, useMemo, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import {
  createUnsupportedWalletAnalyticsEvent,
  getUnsupportedWalletAnalyticsSignature,
  UnsupportedWalletAnalyticsData,
} from './unsupportedWalletAnalytics.utils'

import { useFallbackHandlerVerification } from '../../hooks/useFallbackHandlerVerification'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'

interface UseUnsupportedWalletAnalyticsParams {
  isSafeViaWc: boolean
  localFormValidation: TwapFormState | null
}

export function useUnsupportedWalletAnalytics({
  isSafeViaWc,
  localFormValidation,
}: UseUnsupportedWalletAnalyticsParams): UnsupportedWalletAnalyticsData {
  const { account, chainId } = useWalletInfo()
  const { isSmartContractWallet, walletName } = useWalletDetails()
  const { inputCurrencyAmount, inputCurrencyFiatAmount, outputCurrencyAmount, outputCurrencyFiatAmount } =
    useAdvancedOrdersDerivedState()
  const verification = useFallbackHandlerVerification()
  const cowAnalytics = useCowAnalytics()
  const lastUnsupportedWalletEventSignatureRef = useRef<string | null>(null)

  const unsupportedWalletAnalyticsData = useMemo(() => {
    return {
      chainId,
      walletName,
      isSafeViaWc,
      isSmartContractWallet,
      verificationState: verification ?? undefined,
      sellTokenSymbol: inputCurrencyAmount?.currency.symbol,
      buyTokenSymbol: outputCurrencyAmount?.currency.symbol,
      sellAmount: inputCurrencyAmount?.toExact(),
      buyAmount: outputCurrencyAmount?.toExact(),
      sellAmountUsd: inputCurrencyFiatAmount?.toExact(),
      buyAmountUsd: outputCurrencyFiatAmount?.toExact(),
    }
  }, [
    chainId,
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    isSafeViaWc,
    isSmartContractWallet,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    verification,
    walletName,
  ])

  useEffect(() => {
    if (
      !account ||
      !unsupportedWalletAnalyticsData.verificationState ||
      localFormValidation !== TwapFormState.TX_BUNDLING_NOT_SUPPORTED
    ) {
      return
    }

    const nextSignature = getUnsupportedWalletAnalyticsSignature(unsupportedWalletAnalyticsData)

    if (lastUnsupportedWalletEventSignatureRef.current === nextSignature) {
      return
    }

    lastUnsupportedWalletEventSignatureRef.current = nextSignature
    // Preserve the legacy event name for downstream dashboards while routing it through the
    // same deduped blocked-wallet impression logic as the new detailed event.
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.TWAP,
      action: 'non-compatible',
    })
    cowAnalytics.sendEvent(
      createUnsupportedWalletAnalyticsEvent('twap_unsupported_wallet_viewed', unsupportedWalletAnalyticsData),
    )
  }, [account, cowAnalytics, localFormValidation, unsupportedWalletAnalyticsData])

  return unsupportedWalletAnalyticsData
}
