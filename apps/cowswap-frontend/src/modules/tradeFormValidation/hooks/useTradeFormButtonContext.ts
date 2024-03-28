import { useMemo } from 'react'

import { useWalletDetails } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

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
  const toggleWalletModal = useToggleWalletModal()

  return useMemo(() => {
    if (!derivedState) return null

    const context: TradeFormButtonContext = {
      defaultText,
      derivedState,
      quote,
      isSupportedWallet,
      ...callbacks,
      wrapNativeFlow,
      connectWallet: toggleWalletModal,
      isAprilFoolsEnabled: false,
      imFeelingLucky: () => void 0,
    }

    return context
  }, [defaultText, derivedState, quote, isSupportedWallet, callbacks, wrapNativeFlow, toggleWalletModal])
}
