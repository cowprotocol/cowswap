import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'

import { useIsOnline } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { useENSAddress } from '@cowprotocol/ens'
import { useIsTradeUnsupported, useIsXstockToken, useTryFindToken } from '@cowprotocol/tokens'
import {
  useGnosisSafeInfo,
  useIsRestoringConnection,
  useIsSafeWallet,
  useIsTxBundlingSupported,
  useWalletDetails,
  useWalletInfo,
} from '@cowprotocol/wallet'

import { useHasHookBridgeProvidersEnabled } from 'entities/bridgeProvider'
import { captchaCanQuoteAtom } from 'entities/captcha/state/captchaCanQuoteAtom'
import { captchaInteractionRequiredAtom } from 'entities/captcha/state/captchaInteractionRequiredAtom'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useCurrentAccountProxy } from 'modules/accountProxy'
import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { useApproveState, useGetAmountToSignApprove, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { RwaTokenStatus, useRwaTokenStatus } from 'modules/rwa'
import { useDerivedTradeState, useIsWrapOrUnwrap, useNonEvmReceiverConfirmed, useTradePriceImpact } from 'modules/trade'
import { TradeQuoteState, useTradeQuote } from 'modules/tradeQuote'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { TradeType } from 'common/modules/tradeNavigation'
import { featureFlagsStatusAtom } from 'common/state/featureFlagsState'
import { getBridgeIntermediateTokenAddress } from 'common/utils/getBridgeIntermediateTokenAddress'

import { useTokenCustomTradeError } from './useTokenCustomTradeError'

import { TradeFormValidationCommonContext } from '../types'

// eslint-disable-next-line max-lines-per-function
export function useTradeFormValidationContext(): TradeFormValidationCommonContext | null {
  const { account } = useWalletInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const injectedWidgetParams = useInjectedWidgetParams()
  const tradePriceImpact = useTradePriceImpact()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isOnline = useIsOnline()
  const featureFlagsStatus = useAtomValue(featureFlagsStatusAtom)
  const canQuote = useAtomValue(captchaCanQuoteAtom)
  const captchaInteractionRequired = useAtomValue(captchaInteractionRequiredAtom)
  const { isLoading: isBalancesLoading, hasFirstLoad, error: balancesError } = useTokensBalancesCombined()
  const isRestoringConnection = useIsRestoringConnection()

  const { inputCurrency, outputCurrency, recipient, tradeType } = derivedTradeState || {}
  const customTokenError = useTokenCustomTradeError(inputCurrency, outputCurrency, tradeQuote.error)
  const amountToApprove = useGetAmountToSignApprove()
  const { state: approvalState } = useApproveState(amountToApprove)
  const { address: recipientEnsAddress } = useENSAddress(recipient)
  const isSwapUnsupported =
    useIsTradeUnsupported(inputCurrency, outputCurrency) || isUnsupportedTokenInQuote(tradeQuote)
  const isInputCurrencyXstock = useIsXstockToken(getNonNativeCurrency(inputCurrency))
  const isOutputCurrencyXstock = useIsXstockToken(getNonNativeCurrency(outputCurrency))

  const isBundlingSupported = useIsTxBundlingSupported()
  const isSafeWallet = useIsSafeWallet()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const { allowsOffchainSigning, isSupportedWallet } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const hasHookBridgeProvidersEnabled = useHasHookBridgeProvidersEnabled()
  const { isLoading, data: proxyAccount } = useCurrentAccountProxy()
  const isAccountProxyLoading = hasHookBridgeProvidersEnabled ? isLoading : false
  const isProxySetupValid = hasHookBridgeProvidersEnabled ? !!proxyAccount?.isProxySetupValid : true

  const isNonEvmReceiverConfirmed = useNonEvmReceiverConfirmed()

  const isSafeReadonlyUser = gnosisSafeInfo?.isReadOnly === true

  // Temporary: keep limit-order bundles Safe-only until EIP-5792 order lifecycle tracking lands.
  const isBundlingSupportedForContext =
    tradeType === TradeType.LIMIT_ORDER ? isSafeWallet && isBundlingSupported : isBundlingSupported
  const isApproveRequired = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: isBundlingSupportedForContext,
    allowsOffchainSigning,
  }).reason

  const isInsufficientBalanceOrderAllowed = tradeType === TradeType.LIMIT_ORDER

  const { token: intermediateBuyToken, toBeImported } = useTryFindToken(
    getBridgeIntermediateTokenAddress(tradeQuote.bridgeQuote),
  )

  const { status: rwaStatus } = useRwaTokenStatus({
    inputCurrency,
    outputCurrency,
  })
  const isRestrictedForCountry = rwaStatus === RwaTokenStatus.Restricted

  // TEMP DIAGNOSTIC - remove once the "Maximum update depth exceeded" repro is pinpointed.
  // Logs exactly which named dependency changed reference/value between consecutive renders.
  const diagDeps = {
    hasFirstLoad,
    account,
    approvalState,
    customTokenError,
    derivedTradeState,
    intermediateBuyToken,
    isAccountProxyLoading,
    isApproveRequired,
    isBundlingSupported,
    isInsufficientBalanceOrderAllowed,
    isOnline,
    isProviderNetworkUnsupported,
    isProviderNetworkDeprecated,
    isRestrictedForCountry,
    isSafeReadonlyUser,
    isSupportedWallet,
    isBalancesLoading,
    isSwapUnsupported,
    isWrapUnwrap,
    isProxySetupValid,
    isInputCurrencyXstock,
    isOutputCurrencyXstock,
    recipientEnsAddress,
    toBeImported,
    tradeQuote,
    balancesError,
    injectedWidgetParams,
    tradePriceImpact,
    isNonEvmReceiverConfirmed,
    isRestoringConnection,
    featureFlagsStatus,
    canQuote,
    captchaInteractionRequired,
  }
  const diagPrevRef = useRef<typeof diagDeps | null>(null)
  const diagRenderCountRef = useRef(0)
  useEffect(() => {
    diagRenderCountRef.current += 1
    if (diagPrevRef.current) {
      const changed = (Object.keys(diagDeps) as Array<keyof typeof diagDeps>).filter(
        (key) => !Object.is(diagPrevRef.current![key], diagDeps[key]),
      )
      if (changed.length > 0) {
        console.log(
          `[DIAG useTradeFormValidationContext] render #${diagRenderCountRef.current} changed deps:`,
          changed,
          changed.length === 1
            ? { [changed[0]]: { prev: diagPrevRef.current[changed[0]], next: diagDeps[changed[0]] } }
            : '',
        )
      }
    }
    diagPrevRef.current = diagDeps
  })
  // END TEMP DIAGNOSTIC

  return useMemo(() => {
    if (!derivedTradeState) return null

    return {
      account,
      isWrapUnwrap,
      isBundlingSupported,
      isSupportedWallet,
      isSwapUnsupported,
      isSafeReadonlyUser,
      recipientEnsAddress,
      approvalState,
      tradeQuote,
      isApproveRequired,
      isInsufficientBalanceOrderAllowed,
      isProviderNetworkUnsupported,
      isProviderNetworkDeprecated,
      isOnline,
      derivedTradeState,
      intermediateTokenToBeImported: !!intermediateBuyToken && toBeImported,
      isAccountProxyLoading,
      isProxySetupValid,
      customTokenError,
      isRestrictedForCountry,
      isBalancesLoading: !hasFirstLoad || isBalancesLoading,
      balancesError,
      injectedWidgetParams,
      tradePriceImpact,
      isInputCurrencyXstock,
      isOutputCurrencyXstock,
      isNonEvmReceiverConfirmed,
      isRestoringConnection,
      isCaptchaPending:
        featureFlagsStatus === 'loading' ||
        (featureFlagsStatus === 'ready' && !canQuote && !captchaInteractionRequired),
      isCaptchaRequired: featureFlagsStatus === 'ready' && !canQuote && captchaInteractionRequired,
    }
  }, [
    hasFirstLoad,
    account,
    approvalState,
    customTokenError,
    derivedTradeState,
    intermediateBuyToken,
    isAccountProxyLoading,
    isApproveRequired,
    isBundlingSupported,
    isInsufficientBalanceOrderAllowed,
    isOnline,
    isProviderNetworkUnsupported,
    isProviderNetworkDeprecated,
    isRestrictedForCountry,
    isSafeReadonlyUser,
    isSupportedWallet,
    isBalancesLoading,
    isSwapUnsupported,
    isWrapUnwrap,
    isProxySetupValid,
    isInputCurrencyXstock,
    isOutputCurrencyXstock,
    recipientEnsAddress,
    toBeImported,
    tradeQuote,
    balancesError,
    injectedWidgetParams,
    tradePriceImpact,
    isNonEvmReceiverConfirmed,
    isRestoringConnection,
    featureFlagsStatus,
    canQuote,
    captchaInteractionRequired,
  ])
}

function getNonNativeCurrency(currency: Nullish<Currency>): Token | null {
  if (!currency || getIsNativeToken(currency) || !('address' in currency)) {
    return null
  }

  return currency
}

function isUnsupportedTokenInQuote(state: TradeQuoteState): boolean {
  return state.error instanceof QuoteApiError && state.error?.type === QuoteApiErrorCodes.UnsupportedToken
}
