import { useMemo } from 'react'

import { useIsOnline } from '@cowprotocol/common-hooks'
import { useENSAddress } from '@cowprotocol/ens'
import { useIsTradeUnsupported } from '@cowprotocol/tokens'
import { useGnosisSafeInfo, useIsTxBundlingSupported, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useCurrentAccountProxy } from 'modules/accountProxy'
import { useTryFindIntermediateToken } from 'modules/bridge'
import { useApproveState, useGetAmountToSignApprove, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { TradeType, useDerivedTradeState, useIsWrapOrUnwrap } from 'modules/trade'
import { TradeQuoteState, useTradeQuote } from 'modules/tradeQuote'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useTokenCustomTradeError } from './useTokenCustomTradeError'

import { TradeFormValidationCommonContext } from '../types'

export function useTradeFormValidationContext(): TradeFormValidationCommonContext | null {
  const { account } = useWalletInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isOnline = useIsOnline()

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
  const { isLoading, data: proxyAccount } = useCurrentAccountProxy()

  const isSafeReadonlyUser = gnosisSafeInfo?.isReadOnly === true

  const isApproveRequired = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: isBundlingSupported,
  }).reason

  const isInsufficientBalanceOrderAllowed = tradeType === TradeType.LIMIT_ORDER

  const { intermediateBuyToken, toBeImported } = useTryFindIntermediateToken(tradeQuote.bridgeQuote)

  const commonContext = {
    account,
    isWrapUnwrap,
    isBundlingSupported: !!isBundlingSupported,
    isSupportedWallet,
    isSwapUnsupported,
    isSafeReadonlyUser,
    recipientEnsAddress,
    approvalState,
    tradeQuote,
    isApproveRequired,
    isInsufficientBalanceOrderAllowed,
    isProviderNetworkUnsupported,
    isOnline,
    derivedTradeState,
    intermediateTokenToBeImported: !!intermediateBuyToken && toBeImported,
    isAccountProxyLoading: isLoading,
    isProxySetupValid: proxyAccount?.isProxySetupValid,
    customTokenError,
  }

  return useMemo(() => {
    if (!derivedTradeState) return null

    return {
      ...commonContext,
      derivedTradeState,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(commonContext), derivedTradeState])
}

function isUnsupportedTokenInQuote(state: TradeQuoteState): boolean {
  return state.error instanceof QuoteApiError && state.error?.type === QuoteApiErrorCodes.UnsupportedToken
}
