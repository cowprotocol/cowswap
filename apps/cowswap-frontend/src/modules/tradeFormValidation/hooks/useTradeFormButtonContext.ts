import { useMemo } from 'react'

import { useOpenWalletConnectionModal, useWalletDetails } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useWrapNativeFlow } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeQuote } from 'modules/tradeQuote'

import { TradeFormButtonContext } from '../types'

export function useTradeFormButtonContext(
  defaultText: string,
  confirmTrade: () => void,
): TradeFormButtonContext | null {
  const derivedState = useDerivedTradeState()
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()
  const quote = useTradeQuote()
  const toggleWalletModal = useOpenWalletConnectionModal()
  const { standaloneMode } = useInjectedWidgetParams()

  return useMemo(() => {
    if (!derivedState) return null

    return {
      defaultText,
      derivedState,
      quote,
      isSupportedWallet,
      confirmTrade,
      wrapNativeFlow,
      connectWallet: toggleWalletModal,
      widgetStandaloneMode: standaloneMode,
    }
  }, [
    defaultText,
    derivedState,
    quote,
    isSupportedWallet,
    confirmTrade,
    wrapNativeFlow,
    toggleWalletModal,
    standaloneMode,
  ])
}
