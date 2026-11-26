import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { useConnection, useSwitchChain } from 'wagmi'

import { tradeChainIdAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'

import { ASSET_TOKEN_SEARCH_PARAM, getTokenKey, type RwaToken } from '@/entities/asset'

/**
 * Selects the token of the `ASSET_TOKEN_SEARCH_PARAM` search param once the wallet connection settles, and switches
 * the wallet to its network. A token the asset page doesn't list, or a network the wallet can't switch to, leaves
 * the default selection.
 */
export function useTradeTokenFromUrl(tokens: RwaToken[]): void {
  const { status, chainId: walletChainId } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const setChainId = useSetAtom(tradeChainIdAtom)
  const setTokenKey = useSetAtom(tradeTokenKeyAtom)
  const appliedTokenKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'connecting' || status === 'reconnecting') return

    const tokenKey = new URLSearchParams(window.location.search).get(ASSET_TOKEN_SEARCH_PARAM)
    const token = tokens.find((item) => getTokenKey(item) === tokenKey)

    if (!token || appliedTokenKeyRef.current === tokenKey) return

    appliedTokenKeyRef.current = tokenKey
    setChainId(token.chainId)
    setTokenKey(getTokenKey(token))

    if (status !== 'connected' || walletChainId === token.chainId) return

    switchChain(
      { chainId: token.chainId },
      {
        onError: () => {
          setChainId(null)
          setTokenKey(null)
        },
      },
    )
  }, [tokens, status, walletChainId, switchChain, setChainId, setTokenKey])
}
