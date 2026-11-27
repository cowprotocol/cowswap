import { useEffect, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useConnection, useSwitchChain } from 'wagmi'

/** wagmi's `useSwitchChain` mutation key, shared by every switch request on the page */
export const SWITCH_CHAIN_MUTATION_KEY = ['switchChain']

/**
 * Asks a wallet connected on another network than `tradeChainId` to switch to it, once per asset page, when it first
 * reads as connected there. The widget only loads on the trade network, so a rejected switch leaves the switch prompt.
 * It waits for the page's other effects and leaves the wallet alone when one of them already asked for a switch.
 */
export function useSwitchWalletToTradeNetwork(ticker: string, tradeChainId: number | undefined): void {
  const { status, chainId: walletChainId } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const queryClient = useQueryClient()
  const checkedTickerRef = useRef<string | null>(null)

  useEffect(() => {
    if (status !== 'connected' || !tradeChainId || checkedTickerRef.current === ticker) return

    let isCancelled = false

    queueMicrotask(() => {
      if (isCancelled || checkedTickerRef.current === ticker) return

      checkedTickerRef.current = ticker

      const isSwitchPending = queryClient.isMutating({ mutationKey: SWITCH_CHAIN_MUTATION_KEY }) > 0

      if (walletChainId === tradeChainId || isSwitchPending) return

      switchChain({ chainId: tradeChainId })
    })

    return () => {
      isCancelled = true
    }
  }, [ticker, tradeChainId, status, walletChainId, switchChain, queryClient])
}
