import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import useSWR, { SWRConfiguration } from 'swr'
import ms from 'ms.macro'
import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { usePrevious } from '@cowprotocol/common-hooks'

import {
  allTokenListsAtom,
  tokenListsUpdatingAtom,
  upsertAllTokenListsInfoAtom,
} from '../../state/tokenLists/tokenListsStateAtom'
import { fetchTokenList, TokenListResult } from '../../services/fetchTokenList'
import { setTokensAtom, tokensStateAtom } from '../../state/tokens/tokensAtom'
import { environmentAtom } from '../../state/environmentAtom'
import { useActiveTokenListsIds } from '../../hooks/useActiveTokenListsIds'
import {
  getFulfilledResults,
  getIsTimeToUpdate,
  LAST_UPDATE_TIME_KEY,
  parseTokenListResults,
  updateTokensLists,
} from './helpers'

const TOKENS_LISTS_UPDATER_INTERVAL = ms`6h`

const swrOptions: SWRConfiguration = {
  refreshInterval: TOKENS_LISTS_UPDATER_INTERVAL,
  revalidateOnFocus: false,
}

export function TokensListsUpdater({ chainId: currentChainId }: { chainId: SupportedChainId }) {
  const [{ chainId }, setEnvironment] = useAtom(environmentAtom)
  const allTokensLists = useAtomValue(allTokenListsAtom)
  const tokensState = useAtomValue(tokensStateAtom)

  const activeTokensListsMap = useActiveTokenListsIds()
  const prevActiveTokensListsMap = usePrevious(activeTokensListsMap)

  const setTokens = useSetAtom(setTokensAtom)
  const setTokenListsUpdating = useSetAtom(tokenListsUpdatingAtom)
  const setTokenLists = useSetAtom(upsertAllTokenListsInfoAtom)

  useEffect(() => {
    setEnvironment({ chainId: currentChainId })
  }, [setEnvironment, currentChainId])

  // Fetch tokens lists once in 6 hours
  const { data: fetchedTokens, isLoading } = useSWR<TokenListResult[] | null>(
    ['TokensListsUpdater', allTokensLists, chainId],
    () => {
      if (!getIsTimeToUpdate(chainId)) return null

      return Promise.allSettled(allTokensLists.map(fetchTokenList)).then(getFulfilledResults)
    },
    swrOptions
  )

  // Fulfill tokens lists with tokens from fetched lists
  useEffect(() => {
    setTokenListsUpdating(isLoading)

    if (isLoading || !fetchedTokens) return

    const { activeTokens, inactiveTokens, lists } = parseTokenListResults(chainId, fetchedTokens, activeTokensListsMap)

    localStorage.setItem(LAST_UPDATE_TIME_KEY(chainId), Date.now().toString())

    setTokenLists(chainId, lists)
    setTokens(chainId, { activeTokens, inactiveTokens })
  }, [fetchedTokens, isLoading, chainId, setTokens, setTokenLists, setTokenListsUpdating, activeTokensListsMap])

  // Update tokens state if active tokens lists map was changed
  useEffect(() => {
    // Do updates only when activeTokensListsMap is changed
    if (prevActiveTokensListsMap === activeTokensListsMap) return
    // Don't update when there are fetched tokens, because they will be updated in useEffect() above
    if (fetchedTokens) return

    const update = updateTokensLists(tokensState, activeTokensListsMap)

    if (update) {
      setTokens(chainId, update)
    }
  }, [fetchedTokens, chainId, activeTokensListsMap, prevActiveTokensListsMap, tokensState, setTokens])

  return null
}
