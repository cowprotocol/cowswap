import { useAtomValue } from 'jotai'

import { LpToken, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'

import useSWR from 'swr'

import { lpTokensByCategoryAtom } from '../../state/tokens/allTokensAtom'
import { TokenListCategory } from '../../types'

const fallbackData: LpToken[] = []

export function useAllLpTokens(categories: TokenListCategory[] | null): LpToken[] {
  const lpTokensByCategory = useAtomValue(lpTokensByCategoryAtom)

  return useSWR(
    categories ? [lpTokensByCategory, categories] : null,
    ([lpTokensByCategory, categories]) => {
      return categories.reduce<LpToken[]>((acc, category) => {
        if (category === TokenListCategory.LP || category === TokenListCategory.COW_AMM_LP) {
          acc.push(...lpTokensByCategory[category])
        }

        return acc
      }, [])
    },
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData },
  ).data
}
