import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  ListState,
  useAllListsList,
  useTokenListsTags,
  useUnsupportedTokens,
  useUserAddedTokens,
} from '@cowprotocol/tokens'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { usePermitCompatibleTokens } from 'modules/permit'

export interface TokenDataSources {
  userAddedTokens: TokenWithLogo[]
  allTokenLists: ListState[]
  balancesState: ReturnType<typeof useTokensBalancesCombined>
  unsupportedTokens: ReturnType<typeof useUnsupportedTokens>
  permitCompatibleTokens: ReturnType<typeof usePermitCompatibleTokens>
  tokenListTags: ReturnType<typeof useTokenListsTags>
}

export function useTokenDataSources(): TokenDataSources {
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllListsList()
  const balancesState = useTokensBalancesCombined()
  const unsupportedTokens = useUnsupportedTokens()
  const permitCompatibleTokens = usePermitCompatibleTokens()
  const tokenListTags = useTokenListsTags()

  return useMemo(
    () => ({
      userAddedTokens,
      allTokenLists,
      balancesState,
      unsupportedTokens,
      permitCompatibleTokens,
      tokenListTags,
    }),
    [userAddedTokens, allTokenLists, balancesState, unsupportedTokens, permitCompatibleTokens, tokenListTags],
  )
}
