import { useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'

import { LpToken, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { LpTokenProvider } from '@cowprotocol/types'

import useSWR from 'swr'

import { useAllActiveTokens } from './useAllActiveTokens'

import { inactiveTokensAtom } from '../../state/tokens/allTokensAtom'
import { TokenListCategory } from '../../types'

const fallbackData: LpToken[] = []
const loadableInactiveTokensAtom = loadable(inactiveTokensAtom)

export function useAllLpTokens(categories: TokenListCategory[] | null): LpToken[] {
  const activeTokens = useAllActiveTokens().tokens
  const inactiveResult = useAtomValue(loadableInactiveTokensAtom)
  const inactiveTokens = inactiveResult.state === 'hasData' ? inactiveResult.data : []

  return useSWR(
    categories ? [activeTokens, inactiveTokens, categories] : null,
    ([activeTokens, inactiveTokens, categories]) => {
      const activeTokensMap = activeTokens.reduce<Record<string, true>>((acc, token) => {
        acc[token.address] = true
        return acc
      }, {})

      const allTokens = [...activeTokens, ...inactiveTokens.filter((token) => !activeTokensMap[token.address])]
      const selectOnlyCoWAmm = categories?.length === 1 && categories.includes(TokenListCategory.COW_AMM_LP)

      return allTokens.filter((token) => {
        const isLp = token instanceof LpToken
        return isLp ? (selectOnlyCoWAmm ? token.lpTokenProvider === LpTokenProvider.COW_AMM : true) : false
      }) as LpToken[]
    },
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData },
  ).data
}
