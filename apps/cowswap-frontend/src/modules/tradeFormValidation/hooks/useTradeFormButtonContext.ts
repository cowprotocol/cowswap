import { useMemo } from 'react'

import { useWalletDetails } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useAmountsToSignFromQuote, useDerivedTradeState, useWrapNativeFlow } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useTokenCustomTradeError } from './useTokenCustomTradeError'

import { TradeFormButtonContext } from '../types'

export function useTradeFormButtonContext(
  defaultText: string,
  confirmTrade: () => void,
  supportsPartialApprove = false,
): TradeFormButtonContext | null {
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()
  const quote = useTradeQuote()
  const toggleWalletModal = useToggleWalletModal()
  const { standaloneMode } = useInjectedWidgetParams()
  const derivedState = useDerivedTradeState()
  const amountToApprove = useGetAmountToSignApprove()
  const { maximumSendSellAmount: minAmountToSignForSwap } = useAmountsToSignFromQuote() || {}
  const customTokenError = useTokenCustomTradeError(
    derivedState?.inputCurrency,
    derivedState?.outputCurrency,
    quote.error,
  )

  return useMemo(() => {
    if (!derivedState) return null

    return {
      defaultText,
      amountToApprove,
      derivedState,
      quote,
      isSupportedWallet,
      confirmTrade,
      wrapNativeFlow,
      connectWallet: toggleWalletModal,
      widgetStandaloneMode: standaloneMode,
      supportsPartialApprove,
      customTokenError,
      minAmountToSignForSwap,
    } satisfies TradeFormButtonContext
  }, [
    defaultText,
    amountToApprove,
    derivedState,
    quote,
    isSupportedWallet,
    confirmTrade,
    wrapNativeFlow,
    toggleWalletModal,
    standaloneMode,
    supportsPartialApprove,
    customTokenError,
    minAmountToSignForSwap,
  ])
}
