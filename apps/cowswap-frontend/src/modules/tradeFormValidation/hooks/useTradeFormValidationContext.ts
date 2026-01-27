import { useMemo } from 'react'

import { useIsOnline } from '@cowprotocol/common-hooks'
import { useENSAddress } from '@cowprotocol/ens'
import { useIsTradeUnsupported, useTryFindToken } from '@cowprotocol/tokens'
import { useGnosisSafeInfo, useIsTxBundlingSupported, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useHasHookBridgeProvidersEnabled } from 'entities/bridgeProvider'

import { useCurrentAccountProxy } from 'modules/accountProxy/hooks/useCurrentAccountProxy'
import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { useApproveState, useGetAmountToSignApprove, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { RwaTokenStatus, useRwaTokenStatus } from 'modules/rwa'
import { TradeType, useDerivedTradeState, useIsWrapOrUnwrap, useRecipientRequirement } from 'modules/trade'
import { TradeQuoteState, useTradeQuote } from 'modules/tradeQuote'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { getBridgeIntermediateTokenAddress } from 'common/utils/getBridgeIntermediateTokenAddress'

import { useTokenCustomTradeError } from './useTokenCustomTradeError'

import { TradeFormValidationCommonContext } from '../types'

// eslint-disable-next-line max-lines-per-function
export function useTradeFormValidationContext(): TradeFormValidationCommonContext | null {
  const { account } = useWalletInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isOnline = useIsOnline()
  const { isLoading: isBalancesLoading, hasFirstLoad, error: balancesError } = useTokensBalancesCombined()

  const { inputCurrency, outputCurrency, recipient, tradeType } = derivedTradeState || {}
  const customTokenError = useTokenCustomTradeError(inputCurrency, outputCurrency, tradeQuote.error)
  const amountToApprove = useGetAmountToSignApprove()
  const { state: approvalState } = useApproveState(amountToApprove)
  const { address: recipientEnsAddress } = useENSAddress(recipient)
  const isSwapUnsupported =
    useIsTradeUnsupported(inputCurrency, outputCurrency) || isUnsupportedTokenInQuote(tradeQuote)

  const isBundlingSupported = useIsTxBundlingSupported()
  const isWrapUnwrap = useIsWrapOrUnwrap()
  const { isSupportedWallet } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const hasHookBridgeProvidersEnabled = useHasHookBridgeProvidersEnabled()
  const { isLoading, data: proxyAccount } = useCurrentAccountProxy()
  const isAccountProxyLoading = hasHookBridgeProvidersEnabled ? isLoading : false
  const isProxySetupValid = hasHookBridgeProvidersEnabled ? !!proxyAccount?.isProxySetupValid : true

  const isSafeReadonlyUser = gnosisSafeInfo?.isReadOnly === true
  const recipientRequirement = useRecipientRequirement()

  const isApproveRequired = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: isBundlingSupported,
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
      recipientRequirement,
      approvalState,
      tradeQuote,
      isApproveRequired,
      isInsufficientBalanceOrderAllowed,
      isProviderNetworkUnsupported,
      isOnline,
      derivedTradeState,
      intermediateTokenToBeImported: !!intermediateBuyToken && toBeImported,
      isAccountProxyLoading,
      isProxySetupValid,
      customTokenError,
      isRestrictedForCountry,
      isBalancesLoading: !hasFirstLoad || isBalancesLoading,
      balancesError,
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
    isRestrictedForCountry,
    isSafeReadonlyUser,
    isSupportedWallet,
    isBalancesLoading,
    isSwapUnsupported,
    isWrapUnwrap,
    isProxySetupValid,
    recipientEnsAddress,
    recipientRequirement,
    toBeImported,
    tradeQuote,
    balancesError,
  ])
}

function isUnsupportedTokenInQuote(state: TradeQuoteState): boolean {
  return state.error instanceof QuoteApiError && state.error?.type === QuoteApiErrorCodes.UnsupportedToken
}
