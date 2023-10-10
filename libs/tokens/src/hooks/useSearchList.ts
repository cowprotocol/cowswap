import useSWR, { SWRResponse } from 'swr'
import { fetchTokenList } from '../services/fetchTokenList'
import { parseENSAddress } from '@cowprotocol/common-utils'
import { useAtomValue } from 'jotai'
import { allTokenListsInfoAtom, allTokenListsAtom } from '../state/tokenLists/tokenListsStateAtom'
import { useMemo } from 'react'
import { getIsTokenListWithUrl } from '../utils/getIsTokenListWithUrl'
import { FetchedTokenList, TokenListInfo } from '../types'
import { buildTokenListInfo } from '../utils/buildTokenListInfo'
import { TokenInfo } from '@uniswap/token-lists'

export type ListSearchResponse =
  | {
      source: 'existing'
      response: TokenListInfo
    }
  | {
      source: 'external'
      response: SWRResponse<FetchedTokenList | null>
    }

export function useSearchList(input: string | null): ListSearchResponse {
  const allTokensLists = useAtomValue(allTokenListsAtom)
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

  const response = useSWR<FetchedTokenList | null>(
    ['useSearchList', listSource, existingList],
    () => {
      if (!listSource || existingList) return null

      return fetchTokenList(listSource).then((res) => {
        const info = buildTokenListInfo(res)
        const tokens = res.list.tokens

        return { info, tokens }
      })
    },
    {}
  )

  return existingList ? { source: 'existing', response: existingList } : { source: 'external', response }
}
