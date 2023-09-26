import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'react'

import { MAINNET_PROVIDER } from '@cowprotocol/common-const'
import { resolveENSContentHash } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TokenList } from '@uniswap/token-lists'

import { nanoid } from '@reduxjs/toolkit'
import ms from 'ms.macro'

import { useAppDispatch } from 'legacy/state/hooks'
import { fetchTokenList } from 'legacy/state/lists/actions'

import getTokenList from 'lib/hooks/useTokenList/fetchTokenList'

const TOKENS_LIST_ENS_CACHE_TIMEOUT = ms`6h`

interface TokensListEnsCache {
  timestamp: number
  value: string
}

const tokensListEnsCachesAtom = atomWithStorage<{ [ensName: string]: TokensListEnsCache }>('tokensListEnsCaches:v1', {})

const isCacheValid = ({ timestamp }: TokensListEnsCache) => Date.now() - timestamp < TOKENS_LIST_ENS_CACHE_TIMEOUT

export function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
  const dispatch = useAppDispatch()
  const { chainId } = useWalletInfo()

  const [tokensListEnsCaches, setTokensListEnsCaches] = useAtom(tokensListEnsCachesAtom)

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (listUrl: string, sendDispatch = true) => {
      const requestId = nanoid()
      sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl, chainId }))
      return getTokenList(listUrl, (ensName: string) => {
        const cached = tokensListEnsCaches[ensName]

        if (cached) {
          // Return cached value if it's not stale
          if (isCacheValid(cached)) {
            return Promise.resolve(cached.value)
          } else {
            // Otherwise, remove it from the cache
            const cacheCopy = { ...tokensListEnsCaches }
            delete cacheCopy[ensName]
            setTokensListEnsCaches(cacheCopy)
          }
        }

        return resolveENSContentHash(ensName, MAINNET_PROVIDER).then((value) => {
          // Cache the fetched value
          setTokensListEnsCaches({ ...tokensListEnsCaches, [ensName]: { timestamp: Date.now(), value } })

          return value
        })
      })
        .then((tokenList) => {
          // Mod: add chainId
          sendDispatch && dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId, chainId }))
          return tokenList
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error)
          sendDispatch &&
            dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message, chainId }))
          throw error
        })
    },
    [chainId, dispatch, setTokensListEnsCaches, tokensListEnsCaches]
  )
}
