import { useMemo } from 'react'

import { useWalletDetails } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useReceiveAmountInfo, useWrapNativeFlow } from 'modules/trade'
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
  const receiveAmountInfo = useReceiveAmountInfo()

  return useMemo(() => {
    if (!receiveAmountInfo) return null

    return {
      defaultText,
      receiveAmountInfo,
      quote,
      isSupportedWallet,
      confirmTrade,
      wrapNativeFlow,
      connectWallet: toggleWalletModal,
      widgetStandaloneMode: standaloneMode,
    }
  }, [
    defaultText,
    receiveAmountInfo,
    quote,
    isSupportedWallet,
    confirmTrade,
    wrapNativeFlow,
    toggleWalletModal,
    standaloneMode,
  ])
}
