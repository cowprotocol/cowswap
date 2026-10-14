import { useMemo } from 'react'

import { useENSAddress } from '@cowprotocol/ens'
import { useWalletDetails } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useAmountsToSignFromQuote, useDerivedTradeState, useWrapNativeFlow } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useSolanaNativeShortfall } from './useSolanaNativeShortfall'
import { useTokenCustomTradeError } from './useTokenCustomTradeError'

import { TradeFormButtonContext } from '../types'

interface TradeFormButtonAnalytics {
  confirmClickEvent?: string
  approveClickEvent?: string
}

export function useTradeFormButtonContext(
  defaultText: string,
  confirmTrade: () => void,
  supportsPartialApprove = false,
  analytics?: TradeFormButtonAnalytics,
): TradeFormButtonContext | null {
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()
  const quote = useTradeQuote()
  const toggleWalletModal = useToggleWalletModal()
  const { standaloneMode } = useInjectedWidgetParams()
  const derivedState = useDerivedTradeState()
  const amountToApprove = useGetAmountToSignApprove()
  const injectedWidgetParams = useInjectedWidgetParams()
  const { maximumSendSellAmount: minAmountToSignForSwap } = useAmountsToSignFromQuote() || {}
  const customTokenError = useTokenCustomTradeError(
    derivedState?.inputCurrency,
    derivedState?.outputCurrency,
    quote.error,
  )
  const { error: balancesError } = useTokensBalancesCombined()
  const { address: recipientEnsAddress } = useENSAddress(derivedState?.recipient)
  const widgetPriceImpactThreshold = injectedWidgetParams?.disableTrade?.whenPriceImpactIsHigherThan
  const solanaNativeShortfall = useSolanaNativeShortfall()

  return useMemo(() => {
    if (!derivedState) return null

    return {
      defaultText,
      amountToApprove,
      derivedState,
      recipientEnsAddress,
      quote,
      isSupportedWallet,
      confirmTrade,
      wrapNativeFlow,
      connectWallet: toggleWalletModal,
      widgetStandaloneMode: standaloneMode,
      supportsPartialApprove,
      customTokenError,
      minAmountToSignForSwap,
      balancesError,
      confirmClickEvent: analytics?.confirmClickEvent,
      approveClickEvent: analytics?.approveClickEvent,
      widgetPriceImpactThreshold,
      solanaNativeShortfall,
    } satisfies TradeFormButtonContext
  }, [
    defaultText,
    amountToApprove,
    derivedState,
    recipientEnsAddress,
    quote,
    isSupportedWallet,
    confirmTrade,
    wrapNativeFlow,
    toggleWalletModal,
    standaloneMode,
    supportsPartialApprove,
    customTokenError,
    minAmountToSignForSwap,
    balancesError,
    analytics?.confirmClickEvent,
    analytics?.approveClickEvent,
    widgetPriceImpactThreshold,
    solanaNativeShortfall,
  ])
}
