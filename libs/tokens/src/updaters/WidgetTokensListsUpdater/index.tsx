import { useSetAtom, useAtomValue } from 'jotai'
import { ReactNode, useEffect, useMemo } from 'react'

import { TokenInfo } from '@cowprotocol/types'

import useSWR from 'swr'

import { useAddList } from '../../hooks/lists/useAddList'
import { useRemoveList } from '../../hooks/lists/useRemoveList'
import { fetchTokenList } from '../../services/fetchTokenList'
import { updateEnvironmentAtom } from '../../state/environmentAtom'
import { allListsSourcesAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'
import { getFulfilledResults } from '../TokensListsUpdater/helpers'
import { WidgetVirtualListUpdater } from '../WidgetVirtualListUpdater'

export interface CustomTokensListsUpdaterProps {
  tokenLists?: string[]
  sellTokenLists?: string[]
  buyTokenLists?: string[]
  customTokens?: TokenInfo[]
  appCode?: string
  onTokenListAddingError(error: Error): void
  onRemoveList: (source: string) => void
  onAddList: (source: string) => void
}

/**
 * Widget consumer might want to add their own token list
 * To do that, they should provide `tokenLists` parameter in the widget configuration
 * Then the updater will handle the value and add provided token lists to the App
 * Important! Added token lists would be shown only for this widget, they are distinguished by `appCode`
 */
export function WidgetTokensListsUpdater(props: CustomTokensListsUpdaterProps): ReactNode {
  const {
    tokenLists,
    sellTokenLists,
    buyTokenLists,
    appCode,
    customTokens,
    onTokenListAddingError,
    onRemoveList,
    onAddList,
  } = props
  const addList = useAddList(onAddList)
  const removeList = useRemoveList(onRemoveList)

  const allTokensLists = useAtomValue(allListsSourcesAtom)
  const setEnvironment = useSetAtom(updateEnvironmentAtom)

  // All widget-specific lists across all three list types
  const allWidgetLists = useMemo(() => {
    return [...(tokenLists || []), ...(sellTokenLists || []), ...(buyTokenLists || [])]
  }, [tokenLists, sellTokenLists, buyTokenLists])

  useEffect(() => {
    setEnvironment({
      widgetAppCode: appCode,
      selectedLists: allWidgetLists?.map((list) => list.toLowerCase()),
      sellSelectedLists: sellTokenLists?.map((list) => list.toLowerCase()),
      buySelectedLists: buyTokenLists?.map((list) => list.toLowerCase()),
    })
  }, [setEnvironment, appCode, allWidgetLists, sellTokenLists, buyTokenLists])

  // Take only lists that are not already in the default token lists
  const listsToImport = useMemo(() => {
    if (!allWidgetLists.length) return undefined

    return allWidgetLists.filter((list) => {
      const listUrl = list.toLowerCase()
      return !allTokensLists.find((existing) => existing.source.toLowerCase() === listUrl)
    })
  }, [allWidgetLists, allTokensLists])

  const { data: fetchedLists } = useSWR<ListState[] | null>(
    ['useSearchList', listsToImport],
    () => {
      if (!listsToImport) return null

      return Promise.allSettled(
        listsToImport.map((url) => {
          return fetchTokenList({ source: url }).catch((error) => {
            console.error('Failed to fetch token list: ' + url, error)

            return Promise.reject(error)
          })
        }),
      ).then(getFulfilledResults)
    },
    {},
  )

  /**
   * Add new lists
   */
  useEffect(() => {
    if (!fetchedLists?.length) return

    console.debug('Custom lists added: ', fetchedLists)
    fetchedLists.forEach((list) => {
      try {
        addList(list)
      } catch (error) {
        onTokenListAddingError(error)
      }
    })
  }, [fetchedLists, addList, onTokenListAddingError])

  /**
   * Since token lists are stored in the local storage, we need to remove previously added widget-specific lists
   */
  useEffect(() => {
    if (!appCode || !allWidgetLists.length) return

    const enabledUrls = new Set(allWidgetLists.map((list) => list.toLowerCase()))

    // Find all lists that are added for this widget and are no longer in any of the provided list types
    const listsToRemove = allTokensLists.filter((list) => {
      return list.widgetAppCode === appCode && !enabledUrls.has(list.source.toLowerCase())
    })

    listsToRemove.forEach((list) => {
      removeList(list)
    })
  }, [allTokensLists, removeList, appCode, allWidgetLists])

  return <WidgetVirtualListUpdater appCode={appCode} customTokens={customTokens} />
}
