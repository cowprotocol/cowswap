import { atom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { atomFamily } from 'jotai-family'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { fetchTokenList } from '../../services/fetchTokenList'
import { ListState, TokensMap } from '../../types'
import { parseTokenInfo } from '../../utils/parseTokenInfo'
import { tokenMapToListWithLogo } from '../../utils/tokenMapToListWithLogo'

const EMPTY_TOKENS: TokenWithLogo[] = []

async function fetchDefaultTokensForChain(chainId: SupportedChainId): Promise<TokenWithLogo[]> {
  const sources = DEFAULT_TOKENS_LISTS[chainId] ?? []
  if (sources.length === 0) return EMPTY_TOKENS

  const settled = await Promise.allSettled(sources.map((source) => fetchTokenList(source)))
  const tokenMaps = settled
    .filter((result): result is PromiseFulfilledResult<ListState> => result.status === 'fulfilled')
    .map((result) => tokensFromListState(result.value, chainId))

  return tokenMapToListWithLogo(tokenMaps, chainId)
}

function tokensFromListState(list: ListState, chainId: SupportedChainId): TokensMap {
  const map: TokensMap = {}
  list.list.tokens.forEach((token) => {
    const tokenInfo = parseTokenInfo(chainId, token)
    if (!tokenInfo) return

    const key = getAddressKey(tokenInfo.address)
    if (!map[key]) {
      map[key] = tokenInfo
    }
  })
  return map
}

/**
 * Per-chain default (curated) token list, independent of the active chain's
 * user preferences (enabled/disabled lists, custom tokens). Used to resolve
 * cross-chain "sibling" tokens for the multichain balances display — chains
 * the user isn't currently browsing still need a best-effort symbol/decimals/logo
 * lookup for whatever balance the aggregator reports there.
 *
 * Deliberately not `asyncAtomFamily` — that utility evicts and re-fetches a
 * member as soon as its last consumer unmounts, which is right for volatile
 * per-account queries (allowances) but wrong here: the token selector list is
 * virtualized, so rows mount/unmount as the user scrolls or reopens the
 * modal, which would otherwise re-fetch all 11 chains' lists from scratch
 * every time and make the cross-chain row flicker in and out depending on
 * whether that re-fetch happened to finish yet. Each chain is fetched at
 * most once and the result is kept for the lifetime of the page.
 */
export const defaultTokensByChainFamily = atomFamily((chainId: SupportedChainId) => {
  const dataAtom = atom<TokenWithLogo[] | null>(null)
  let hasFetched = false

  dataAtom.onMount = (set) => {
    if (hasFetched) return
    hasFetched = true

    let cancelled = false

    fetchDefaultTokensForChain(chainId)
      .then((tokens) => {
        if (!cancelled) set(tokens)
      })
      .catch((error: unknown) => {
        hasFetched = false
        console.error(`[defaultTokensByChainFamily] fetch failed for chain ${chainId}`, error)
      })

    return () => {
      cancelled = true
    }
  }

  return dataAtom
})
