import { activeTokensListsAtom } from '../../state/tokensListsAtom'
import { useAtomValue } from 'jotai'
import useSWR, { SWRConfiguration } from 'swr'
import ms from 'ms.macro'
import { useEffect } from 'react'
import { fetchTokenList, TokenListResult } from './fetchTokenList'

const TOKENS_LISTS_UPDATER_INTERVAL = ms`6h`

const swrOptions: SWRConfiguration = {
  refreshInterval: TOKENS_LISTS_UPDATER_INTERVAL,
  revalidateOnFocus: false,
}

const LAST_UPDATE_TIME_KEY = 'tokens-lists-updater:last-update-time'

export function TokensListsUpdater() {
  const lists = useAtomValue(activeTokensListsAtom)

  const swrResponse = useSWR<TokenListResult[] | null>(
    ['TokensListsUpdater', lists],
    () => {
      if (!getIsTimeToUpdate()) return null

      return Promise.allSettled(lists.map(fetchTokenList)).then(getFulfilledResults)
    },
    swrOptions
  )

  useEffect(() => {
    const { data, isLoading, error } = swrResponse

    if (isLoading || error || !data) return

    // TODO
    // localStorage.setItem(LAST_UPDATE_TIME_KEY, Date.now().toString())
  }, [swrResponse])

  return null
}

const getIsTimeToUpdate = (): boolean => {
  const lastUpdateTime = +(localStorage.getItem(LAST_UPDATE_TIME_KEY) || 0)

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
