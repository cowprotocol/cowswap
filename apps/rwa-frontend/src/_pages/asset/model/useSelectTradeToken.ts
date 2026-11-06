import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useChainId, useConnection, useSwitchChain } from 'wagmi'

import { flushSync } from 'react-dom'

import { tradeChainIdAtom, tradeSideAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'

import { getTokenKey, type RwaQuoteSide, type RwaToken } from '@/entities/asset'

export const TRADE_WIDGET_ID = 'trade-widget'

const SINGLE_COLUMN_QUERY = '(max-width: 960px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Switches the widget to `side`, then scrolls to it and, below the chart, focuses its side toggle */
export function useJumpToTrade(): (side: RwaQuoteSide) => void {
  const setSide = useSetAtom(tradeSideAtom)

  return useCallback(
    (side: RwaQuoteSide) => {
      // Commits the new side first, so the scroll lands on the widget's final layout
      flushSync(() => setSide(side))
      revealTradeWidget(side)
    },
    [setSide],
  )
}

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
  const jumpToTrade = useJumpToTrade()
  const selectNetwork = useSelectTradeNetwork()
  const setTokenKey = useSetAtom(tradeTokenKeyAtom)

  return useCallback(
    (token: RwaToken, side: RwaQuoteSide) => {
      selectNetwork(token.chainId)
      setTokenKey(getTokenKey(token))
      jumpToTrade(side)
    },
    [jumpToTrade, selectNetwork, setTokenKey],
  )
}

function revealTradeWidget(side: RwaQuoteSide): void {
  const widget = document.getElementById(TRADE_WIDGET_ID)
  if (!widget) return

  const isSingleColumn = window.matchMedia(SINGLE_COLUMN_QUERY).matches

  widget.scrollIntoView({
    behavior: window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'auto' : 'smooth',
    block: isSingleColumn ? 'start' : 'nearest',
  })
  // Beside the chart, a widget taller than the screen sticks with its top, and so the side toggle, above it
  if (isSingleColumn) widget.querySelector<HTMLElement>(`[data-trade-side="${side}"]`)?.focus({ preventScroll: true })
}
