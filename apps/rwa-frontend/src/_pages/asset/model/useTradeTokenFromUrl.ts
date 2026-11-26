import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { tradeChainIdAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'

import { ASSET_TOKEN_SEARCH_PARAM, getTokenKey, type RwaToken } from '@/entities/asset'

/** Selects the token of the `ASSET_TOKEN_SEARCH_PARAM` search param, without switching the wallet network */
export function useTradeTokenFromUrl(tokens: RwaToken[]): void {
  const setChainId = useSetAtom(tradeChainIdAtom)
  const setTokenKey = useSetAtom(tradeTokenKeyAtom)

  useEffect(() => {
    const tokenKey = new URLSearchParams(window.location.search).get(ASSET_TOKEN_SEARCH_PARAM)
    const token = tokens.find((item) => getTokenKey(item) === tokenKey)

    if (!token) return

    setChainId(token.chainId)
    setTokenKey(getTokenKey(token))
  }, [tokens, setChainId, setTokenKey])
}
