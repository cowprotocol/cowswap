import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { activeTokensListsAtom } from '../../state/tokensListsStateAtom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import useSWR, { SWRConfiguration } from 'swr'
import ms from 'ms.macro'
import { useEffect } from 'react'
import { fetchTokenList, TokenListResult } from './fetchTokenList'
import { setTokensAtom } from '../../state/tokensAtom'
import { tokensListsEnvironmentAtom } from '../../state/tokensListsEnvironmentAtom'
import { TokensMap } from '../../types'

const TOKENS_LISTS_UPDATER_INTERVAL = ms`6h`

const swrOptions: SWRConfiguration = {
  refreshInterval: TOKENS_LISTS_UPDATER_INTERVAL,
  revalidateOnFocus: false,
}

const LAST_UPDATE_TIME_KEY = (chainId: SupportedChainId) => `tokens-lists-updater:last-update-time[${chainId}]`

export function TokensListsUpdater({ chainId: currentChainId }: { chainId: SupportedChainId }) {
  const [{ chainId }, setEnvironment] = useAtom(tokensListsEnvironmentAtom)
  const setTokens = useSetAtom(setTokensAtom)
  const lists = useAtomValue(activeTokensListsAtom)

  useEffect(() => {
    setEnvironment({ chainId: currentChainId })
  }, [setEnvironment, currentChainId])

  // Fetch tokens lists once in 6 hours
  const swrResponse = useSWR<TokenListResult[] | null>(
    ['TokensListsUpdater', lists, chainId],
    () => {
      if (!getIsTimeToUpdate(chainId)) return null

      return Promise.allSettled(lists.map(fetchTokenList)).then(getFulfilledResults)
    },
    swrOptions
  )

  // Fullfil tokens map with tokens from fetched lists
  useEffect(() => {
    const { data, isLoading, error } = swrResponse

    if (isLoading || error || !data) return

    const tokensMap = data.reduce<TokensMap>((acc, val) => {
      val.list.tokens.forEach((token) => {
        if (token.chainId === chainId) {
          acc[token.address.toLowerCase()] = token
        }
      })
      return acc
    }, {})

    setTokens(tokensMap)
    localStorage.setItem(LAST_UPDATE_TIME_KEY(chainId), Date.now().toString())
  }, [swrResponse, chainId, setTokens])

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
