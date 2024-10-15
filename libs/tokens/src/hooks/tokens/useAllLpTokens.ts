import { useAtomValue } from 'jotai'

import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'

import useSWR from 'swr'

import { environmentAtom } from '../../state/environmentAtom'
import { listsStatesListAtom } from '../../state/tokenLists/tokenListsStateAtom'
import { TokenListCategory, TokensMap } from '../../types'
import { parseTokenInfo } from '../../utils/parseTokenInfo'
import { tokenMapToListWithLogo } from '../../utils/tokenMapToListWithLogo'

const fallbackData: TokenWithLogo[] = []

export function useAllLpTokens(categories: TokenListCategory[] | null): TokenWithLogo[] {
  const { chainId } = useAtomValue(environmentAtom)
  const state = useAtomValue(listsStatesListAtom)

  return useSWR(
    categories ? [state, chainId, categories] : null,
    ([state, chainId, categories]) => {
      const tokensMap = state.reduce<TokensMap>((acc, list) => {
        if (!list.category || !categories.includes(list.category)) {
          return acc
        }

        list.list.tokens.forEach((token) => {
          const tokenInfo = parseTokenInfo(chainId, token)
          const tokenAddressKey = tokenInfo?.address.toLowerCase()

          if (!tokenInfo || !tokenAddressKey) return

          acc[tokenAddressKey] = tokenInfo
        })

        return acc
      }, {})

      return tokenMapToListWithLogo(tokensMap, chainId)
    },
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData },
  ).data
}
