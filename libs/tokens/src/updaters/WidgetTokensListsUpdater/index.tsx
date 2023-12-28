import { ListState } from '../../types'
import { useAddList } from '../../hooks/lists/useAddList'
import { useAtomValue } from 'jotai/index'
import { allListsSourcesAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { fetchTokenList } from '../../services/fetchTokenList'
import { updateEnvironmentAtom } from '../../state/environmentAtom'
import { useSetAtom } from 'jotai'
import { useRemoveList } from '../../hooks/lists/useRemoveList'
import { getFulfilledResults } from '../TokensListsUpdater/helpers'

interface TokenList {
  url: string
}

export interface CustomTokensListsUpdaterProps {
  tokenLists?: TokenList[]
  appCode?: string
}

/**
 * Widget consumer might want to add their own token list
 * To do that, they should provide `tokenLists` parameter in the widget configuration
 * Then the updater will handle the value and add provided token lists to the App
 * Important! Added token lists would be shown only for this widget, they are distinguished by `appCode`
 */
export function WidgetTokensListsUpdater(props: CustomTokensListsUpdaterProps) {
  const { tokenLists, appCode } = props
  const addList = useAddList()
  const removeList = useRemoveList()
  const allTokensLists = useAtomValue(allListsSourcesAtom)
  const setEnvironment = useSetAtom(updateEnvironmentAtom)

  useEffect(() => {
    const selectedLists = tokenLists ? { selectedLists: tokenLists.map((list) => list.url.toLowerCase()) } : undefined

    setEnvironment({ widgetAppCode: appCode, ...selectedLists })
  }, [setEnvironment, appCode, tokenLists])

  // Take only lists that are not already in the default token lists
  const listsToImport = useMemo(() => {
    if (!tokenLists?.length) return undefined

    return tokenLists.filter((list) => {
      const listUrl = list.url.toLowerCase()

      const listExists = allTokensLists.find((list) => list.source.toLowerCase() === listUrl)

      return !listExists
    })
  }, [tokenLists, allTokensLists])

  const { data: fetchedLists } = useSWR<ListState[] | null>(
    ['useSearchList', listsToImport],
    () => {
      if (!listsToImport) return null

      return Promise.allSettled(
        listsToImport.map(({ url }) => {
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
      addList(list)
    })
  }, [fetchedLists, addList])

  /**
   * Since token lists are stored in the local storage, we need to remove previously added widget-specific lists
   */
  useEffect(() => {
    if (!appCode || !tokenLists?.length) return

    const enabledTokenListsUrls = tokenLists.map((list) => list.url.toLowerCase())

    // Find all lists that are added for this widget and are not in the provided token lists
    const listsToRemove = allTokensLists.filter((list) => {
      return list.widgetAppCode === appCode && !enabledTokenListsUrls.includes(list.source.toLowerCase())
    })

    listsToRemove.forEach((list) => {
      removeList(list)
    })
  }, [allTokensLists, removeList, appCode, tokenLists])

  return null
}
