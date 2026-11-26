import { useEffect, useRef } from 'react'

import { useConnection, useSwitchChain } from 'wagmi'

/**
 * Asks a wallet connected on another network than `tradeChainId` to switch to it, once per asset page, when it first
 * reads as connected there. The widget only loads on the trade network, so a rejected switch leaves the switch prompt.
 */
export function useSwitchWalletToTradeNetwork(ticker: string, tradeChainId: number | undefined): void {
  const { status, chainId: walletChainId } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const checkedTickerRef = useRef<string | null>(null)

  useEffect(() => {
    if (status !== 'connected' || !tradeChainId || checkedTickerRef.current === ticker) return

    checkedTickerRef.current = ticker

    if (walletChainId !== tradeChainId) switchChain({ chainId: tradeChainId })
  }, [ticker, tradeChainId, status, walletChainId, switchChain])
}
