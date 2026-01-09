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

import { useTokensToSelect } from '../../../hooks/useTokensToSelect'

export interface TokenDataSources {
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  areTokensLoading: boolean
  areTokensFromBridge: boolean
  isRouteAvailable: boolean | undefined
  userAddedTokens: TokenWithLogo[]
  allTokenLists: ListState[]
  balancesState: ReturnType<typeof useTokensBalancesCombined>
  unsupportedTokens: ReturnType<typeof useUnsupportedTokens>
  permitCompatibleTokens: ReturnType<typeof usePermitCompatibleTokens>
  tokenListTags: ReturnType<typeof useTokenListsTags>
}

export function useTokenDataSources(): TokenDataSources {
  const tokensState = useTokensToSelect()
  const userAddedTokens = useUserAddedTokens()
  const allTokenLists = useAllListsList()
  const balancesState = useTokensBalancesCombined()
  const unsupportedTokens = useUnsupportedTokens()
  const permitCompatibleTokens = usePermitCompatibleTokens()
  const tokenListTags = useTokenListsTags()

  return useMemo(
    () => ({
      allTokens: tokensState.tokens,
      favoriteTokens: tokensState.favoriteTokens,
      areTokensLoading: tokensState.isLoading,
      areTokensFromBridge: tokensState.areTokensFromBridge,
      isRouteAvailable: tokensState.isRouteAvailable,
      userAddedTokens,
      allTokenLists,
      balancesState,
      unsupportedTokens,
      permitCompatibleTokens,
      tokenListTags,
    }),
    [
      tokensState.tokens,
      tokensState.favoriteTokens,
      tokensState.isLoading,
      tokensState.areTokensFromBridge,
      tokensState.isRouteAvailable,
      userAddedTokens,
      allTokenLists,
      balancesState,
      unsupportedTokens,
      permitCompatibleTokens,
      tokenListTags,
    ],
  )
}
