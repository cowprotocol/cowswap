import { useStore } from 'jotai'
import { useEffect, useRef } from 'react'

import { useConnection, useSwitchChain } from 'wagmi'

import { tradeChainIdAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'

import { ASSET_TOKEN_SEARCH_PARAM, getTokenKey, type RwaToken } from '@/entities/asset'

/**
 * Selects the token of the `ASSET_TOKEN_SEARCH_PARAM` search param once the wallet connection settles, and switches
 * the wallet to its network the first time it is connected, also when it connects after the page loaded, unless the
 * user picked another token by then. A token the asset page doesn't list, or a network the wallet can't switch to,
 * leaves the default selection, unless the user picked another token meanwhile.
 */
export function useTradeTokenFromUrl(tokens: RwaToken[]): void {
  const { status, chainId: walletChainId } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const store = useStore()
  const appliedTokenKeyRef = useRef<string | null>(null)
  const switchCheckedTokenKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'connecting' || status === 'reconnecting') return

    const tokenKey = new URLSearchParams(window.location.search).get(ASSET_TOKEN_SEARCH_PARAM)
    const token = tokens.find((item) => getTokenKey(item) === tokenKey)

    if (!token) return

    const urlTokenKey = getTokenKey(token)

    if (appliedTokenKeyRef.current !== urlTokenKey) {
      appliedTokenKeyRef.current = urlTokenKey
      store.set(tradeChainIdAtom, token.chainId)
      store.set(tradeTokenKeyAtom, urlTokenKey)
    }

    if (status !== 'connected' || switchCheckedTokenKeyRef.current === urlTokenKey) return

    switchCheckedTokenKeyRef.current = urlTokenKey

    if (store.get(tradeTokenKeyAtom) !== urlTokenKey || walletChainId === token.chainId) return

    switchChain(
      { chainId: token.chainId },
      {
        onError: () => {
          if (store.get(tradeTokenKeyAtom) !== urlTokenKey) return

          store.set(tradeChainIdAtom, null)
          store.set(tradeTokenKeyAtom, null)
        },
      },
    )
  }, [tokens, status, walletChainId, switchChain, store])
}
