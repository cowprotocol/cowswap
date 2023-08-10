import { useMemo } from 'react'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useWrapNativeFlow } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeQuote } from 'modules/tradeQuote'
import { useWalletDetails } from 'modules/wallet'

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

    return {
      defaultText,
      derivedState,
      quote,
      isSupportedWallet,
      ...callbacks,
      wrapNativeFlow,
      connectWallet() {
        toggleWalletModal()
      },
    }
  }, [defaultText, derivedState, quote, isSupportedWallet, callbacks, wrapNativeFlow, toggleWalletModal])
}
