import { useMemo } from 'react'

import { useOpenWalletModal, useWalletDetails } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useWrapNativeFlow } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeQuote } from 'modules/tradeQuote'

import { TradeFormButtonContext } from '../types'

interface TradeFormCallbacks {
  doTrade(): void
  confirmTrade(): void
}

export function useTradeFormButtonContext(
  defaultText: string,
  callbacks: TradeFormCallbacks
): TradeFormButtonContext | null {
  const { state: derivedState } = useDerivedTradeState()
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()
  const quote = useTradeQuote()
  const toggleWalletModal = useOpenWalletModal()
  const { standaloneMode } = useInjectedWidgetParams()

  return useMemo(() => {
    if (!derivedState) return null

    return {
      defaultText,
      derivedState,
      quote,
      isSupportedWallet,
      ...callbacks,
      wrapNativeFlow,
      connectWallet: toggleWalletModal,
      widgetStandaloneMode: standaloneMode,
    }
  }, [
    defaultText,
    derivedState,
    quote,
    isSupportedWallet,
    callbacks,
    wrapNativeFlow,
    toggleWalletModal,
    standaloneMode,
  ])
}
