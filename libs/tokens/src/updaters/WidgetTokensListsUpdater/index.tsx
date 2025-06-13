import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/index'
import { useEffect, useMemo } from 'react'

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
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function WidgetTokensListsUpdater(props: CustomTokensListsUpdaterProps) {
  const { tokenLists, appCode, customTokens, onTokenListAddingError, onRemoveList, onAddList } = props
  const addList = useAddList(onAddList)
  const removeList = useRemoveList(onRemoveList)

  const allTokensLists = useAtomValue(allListsSourcesAtom)
  const setEnvironment = useSetAtom(updateEnvironmentAtom)

  useEffect(() => {
    const selectedLists = tokenLists ? { selectedLists: tokenLists.map((list) => list.toLowerCase()) } : undefined

    setEnvironment({ widgetAppCode: appCode, ...selectedLists })
  }, [setEnvironment, appCode, tokenLists])

  // Take only lists that are not already in the default token lists
  const listsToImport = useMemo(() => {
    if (!tokenLists?.length) return undefined

    return tokenLists.filter((list) => {
      const listUrl = list.toLowerCase()

      const listExists = allTokensLists.find((list) => list.source.toLowerCase() === listUrl)

      return !listExists
    })
  }, [tokenLists, allTokensLists])

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
        })
      ).then(getFulfilledResults)
    },
    {}
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
    if (!appCode || !tokenLists?.length) return

    const enabledTokenListsUrls = tokenLists.map((list) => list.toLowerCase())

    // Find all lists that are added for this widget and are not in the provided token lists
    const listsToRemove = allTokensLists.filter((list) => {
      return list.widgetAppCode === appCode && !enabledTokenListsUrls.includes(list.source.toLowerCase())
    })

    listsToRemove.forEach((list) => {
      removeList(list)
    })
  }, [allTokensLists, removeList, appCode, tokenLists])

  return <WidgetVirtualListUpdater appCode={appCode} customTokens={customTokens} />
}
