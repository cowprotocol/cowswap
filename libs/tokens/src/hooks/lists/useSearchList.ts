import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { useMemo } from 'react'

import useSWR, { SWRResponse } from 'swr'

import { fetchTokenList } from '../../services/fetchTokenList'
import { allListsSourcesAtom, listsStatesMapAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { ListState } from '../../types'

const loadableListsStatesMapAtom = loadable(listsStatesMapAtom)

export type ListSearchResponse =
  | {
      source: 'existing'
      response: ListState
    }
  | {
      source: 'external'
      response: SWRResponse<ListState | null>
    }

export function useSearchList(input: string | null): ListSearchResponse {
  const allTokensLists = useAtomValue(allListsSourcesAtom)
  const result = useAtomValue(loadableListsStatesMapAtom)

  const existingList = useMemo(() => {
    if (result.state !== 'hasData') {
      return undefined
    }

    const listsStatesMap = result.data
    const inputLowerCase = input?.toLowerCase()

    const list = allTokensLists.find((list) => list.source === inputLowerCase)

    return list ? listsStatesMap[list.source] : undefined
  }, [allTokensLists, result, input])

  const response = useSWR<ListState | null>(
    ['useSearchList', input, existingList],
    () => {
      if (!input || existingList) return null

      return fetchTokenList({ source: input })
    },
    {
      errorRetryCount: 0,
      revalidateOnFocus: false,
    },
  )

  return existingList ? { source: 'existing', response: existingList } : { source: 'external', response }
}
