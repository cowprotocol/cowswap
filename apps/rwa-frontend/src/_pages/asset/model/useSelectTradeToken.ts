import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useChainId, useConnection, useSwitchChain } from 'wagmi'

import { tradeChainIdAtom, tradeSideAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'

import { getTokenKey, type RwaQuoteSide, type RwaToken } from '@/entities/asset'

export const TRADE_WIDGET_ID = 'trade-widget'

/** Switches the widget to the best quote on `chainId` */
export function useSelectTradeNetwork(): (chainId: number) => void {
  const walletChainId = useChainId()
  const { isConnected } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const setChainId = useSetAtom(tradeChainIdAtom)
  const setTokenKey = useSetAtom(tradeTokenKeyAtom)

  return useCallback(
    (chainId: number) => {
      setChainId(chainId)
      setTokenKey(null)

      // The widget follows the wallet chain, so the network is only picked up once the wallet is on it
      if (isConnected && walletChainId !== chainId) switchChain({ chainId })
    },
    [isConnected, walletChainId, setChainId, setTokenKey, switchChain],
  )
}

/** Picks a token from the "Stock tokens" table, then scrolls to the widget */
export function useSelectTradeToken(): (token: RwaToken, side: RwaQuoteSide) => void {
  const setSide = useSetAtom(tradeSideAtom)
  const selectNetwork = useSelectTradeNetwork()
  const setTokenKey = useSetAtom(tradeTokenKeyAtom)

  return useCallback(
    (token: RwaToken, side: RwaQuoteSide) => {
      setSide(side)
      selectNetwork(token.chainId)
      setTokenKey(getTokenKey(token))

      document.getElementById(TRADE_WIDGET_ID)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    },
    [setSide, selectNetwork, setTokenKey],
  )
}
