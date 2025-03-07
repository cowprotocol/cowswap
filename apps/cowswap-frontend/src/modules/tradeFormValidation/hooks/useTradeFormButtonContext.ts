import { useMemo } from 'react'

import { useWalletDetails } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useAmountsToSign, useDerivedTradeState, useWrapNativeFlow } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { TradeFormButtonContext } from '../types'

export function useTradeFormButtonContext(
  defaultText: string,
  confirmTrade: () => void,
): TradeFormButtonContext | null {
  const wrapNativeFlow = useWrapNativeFlow()
  const { isSupportedWallet } = useWalletDetails()
  const quote = useTradeQuote()
  const toggleWalletModal = useToggleWalletModal()
  const { standaloneMode } = useInjectedWidgetParams()
  const derivedState = useDerivedTradeState()
  const amountsToSign = useAmountsToSign()

  return useMemo(() => {
    if (!derivedState) return null

    return {
      defaultText,
      amountsToSign,
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
    amountsToSign,
    derivedState,
    quote,
    isSupportedWallet,
    confirmTrade,
    wrapNativeFlow,
    toggleWalletModal,
    standaloneMode,
  ])
}
