import useSWR, { SWRResponse } from 'swr'
import { fetchTokenList } from '../services/fetchTokenList'
import { parseENSAddress } from '@cowprotocol/common-utils'
import { useAtomValue } from 'jotai'
import { allTokenListsInfoAtom, allTokensListsAtom } from '../state/tokensListsStateAtom'
import { useMemo } from 'react'
import { getIsTokenListWithUrl } from '../utils/getIsTokenListWithUrl'
import { TokenListInfo } from '../types'
import { buildTokenListInfo } from '../utils/buildTokenListInfo'

export type ListSearchResponse =
  | {
      source: 'existing'
      response: TokenListInfo
    }
  | {
      source: 'external'
      response: SWRResponse<TokenListInfo | null>
    }

export function useSearchList(input: string | null): ListSearchResponse {
  const allTokensLists = useAtomValue(allTokensListsAtom)
  const allTokensListsInfo = useAtomValue(allTokenListsInfoAtom)

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

    return list ? allTokensListsInfo.find((info) => info.id === list.id) : undefined
  }, [allTokensLists, allTokensListsInfo, input])

  const response = useSWR<TokenListInfo | null>(
    ['useSearchList', listSource, existingList],
    () => {
      if (!listSource || existingList) return null

      return fetchTokenList(listSource).then(buildTokenListInfo)
    },
    {}
  )

  return existingList ? { source: 'existing', response: existingList } : { source: 'external', response }
}
