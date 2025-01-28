import { useMemo } from 'react'

import { useWalletDetails } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useIsSellNative, useWrapNativeFlow } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeQuote } from 'modules/tradeQuote'

import { TradeFormButtonContext } from '../types'
import { useIsWrapDisabled } from 'modules/trade/hooks/useIsWrapDisabled'

export function useTradeFormButtonContext(
  defaultText: string,
  confirmTrade: () => void,
): TradeFormButtonContext | null {
  const derivedState = useDerivedTradeState()
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()
  const quote = useTradeQuote()
  const toggleWalletModal = useToggleWalletModal()
  const { standaloneMode } = useInjectedWidgetParams()
  const isWrapDisabled = useIsWrapDisabled()

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
      isWrapDisabled,
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
