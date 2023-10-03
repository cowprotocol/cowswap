import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { activeTokensListsMapAtom, allTokensListsAtom, updateAllTokenListsInfoAtom } from '../../state/tokensListsAtom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import useSWR, { SWRConfiguration } from 'swr'
import ms from 'ms.macro'
import { useEffect } from 'react'
import { fetchTokenList, TokenListResult } from './fetchTokenList'
import { setTokensAtom, TokensMap } from '../../state/tokensAtom'
import { tokensListsEnvironmentAtom } from '../../state/tokensListsEnvironmentAtom'
import { TokenListInfo } from '../../types'

type TokensAndListsUpdate = {
  activeTokens: TokensMap
  inactiveTokens: TokensMap
  lists: { [id: string]: TokenListInfo }
}

const TOKENS_LISTS_UPDATER_INTERVAL = ms`6h`

const swrOptions: SWRConfiguration = {
  refreshInterval: TOKENS_LISTS_UPDATER_INTERVAL,
  revalidateOnFocus: false,
}

const LAST_UPDATE_TIME_KEY = (chainId: SupportedChainId) => `tokens-lists-updater:last-update-time[${chainId}]`

export function TokensListsUpdater({ chainId: currentChainId }: { chainId: SupportedChainId }) {
  const [{ chainId }, setEnvironment] = useAtom(tokensListsEnvironmentAtom)
  const setTokens = useSetAtom(setTokensAtom)
  const setTokenLists = useSetAtom(updateAllTokenListsInfoAtom)
  const allTokensLists = useAtomValue(allTokensListsAtom)
  const activeTokensListsMap = useAtomValue(activeTokensListsMapAtom)

  useEffect(() => {
    setEnvironment({ chainId: currentChainId })
  }, [setEnvironment, currentChainId])

  // Fetch tokens lists once in 6 hours
  const swrResponse = useSWR<TokenListResult[] | null>(
    ['TokensListsUpdater', allTokensLists, chainId],
    () => {
      if (!getIsTimeToUpdate(chainId)) return null

      return Promise.allSettled(allTokensLists.map(fetchTokenList)).then(getFulfilledResults)
    },
    swrOptions
  )

  // Fullfil tokens map with tokens from fetched lists
  useEffect(() => {
    const { data, isLoading, error } = swrResponse

    if (isLoading || error || !data) return

    const { activeTokens, inactiveTokens, lists } = data.reduce<TokensAndListsUpdate>(
      (acc, val) => {
        const isListEnabled = activeTokensListsMap[val.id]

        acc.lists[val.id] = val.list

        val.list.tokens.forEach((token) => {
          if (token.chainId === chainId) {
            const tokenAddress = token.address.toLowerCase()

            if (isListEnabled) {
              acc.activeTokens[tokenAddress] = token
            } else {
              acc.inactiveTokens[tokenAddress] = token
            }
          }
        })

        return acc
      },
      { activeTokens: {}, inactiveTokens: {}, lists: {} }
    )

    localStorage.setItem(LAST_UPDATE_TIME_KEY(chainId), Date.now().toString())

    setTokenLists(lists)
    setTokens({ activeTokens, inactiveTokens })
  }, [swrResponse, chainId, setTokens, setTokenLists, activeTokensListsMap])

  return null
}

const getIsTimeToUpdate = (chainId: SupportedChainId): boolean => {
  const lastUpdateTime = +(localStorage.getItem(LAST_UPDATE_TIME_KEY(chainId)) || 0)

  if (!lastUpdateTime) return true

  return Date.now() - lastUpdateTime > TOKENS_LISTS_UPDATER_INTERVAL
}

const getFulfilledResults = (results: PromiseSettledResult<TokenListResult>[]) => {
  return results.reduce<TokenListResult[]>((acc, val) => {
    if (val.status === 'fulfilled') {
      acc.push(val.value)
    }

    return acc
  }, [])
}
