import useSWR, { SWRResponse } from 'swr'
import { fetchTokenList } from '../../services/fetchTokenList'
import { parseENSAddress } from '@cowprotocol/common-utils'
import { useAtomValue } from 'jotai'
import { allListsSourcesAtom, listsStatesMapAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { useMemo } from 'react'
import { getIsTokenListWithUrl } from '../../utils/getIsTokenListWithUrl'
import { ListState } from '../../types'

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
  const listsStatesMap = useAtomValue(listsStatesMapAtom)

  const listSource = useMemo(() => {
    if (!input) return null

    const id = 'search'
    const isENS = !!parseENSAddress(input)

    return isENS ? { id, ensName: input } : { id, url: input }
  }, [input])

  const existingList = useMemo(() => {
    const inputLowerCase = input?.toLowerCase()

    const list = allTokensLists.find((list) => {
      return getIsTokenListWithUrl(list) ? list.url === inputLowerCase : list.ensName === inputLowerCase
    })

    return list ? listsStatesMap[list.id] : undefined
  }, [allTokensLists, listsStatesMap, input])

  const response = useSWR<ListState | null>(
    ['useSearchList', listSource, existingList],
    () => {
      if (!listSource || existingList) return null

      return fetchTokenList(listSource)
    },
    {}
  )

  return existingList ? { source: 'existing', response: existingList } : { source: 'external', response }
}
