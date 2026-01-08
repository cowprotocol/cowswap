import { Dispatch, SetStateAction, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import {
  ListState,
  TokenListCategory,
  useAddList,
  useAddUserToken,
  useAllListsList,
  useTokenListsTags,
  useUnsupportedTokens,
  useUserAddedTokens,
} from '@cowprotocol/tokens'

import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { usePermitCompatibleTokens } from 'modules/permit'
import { TradeType } from 'modules/trade/types'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { getDefaultTokenListCategories } from './getDefaultTokenListCategories'

import { useTokensToSelect } from '../../hooks/useTokensToSelect'

export type TokenListCategoryState = [TokenListCategory[] | null, Dispatch<SetStateAction<TokenListCategory[] | null>>]

interface TokenAdminActions {
  addCustomTokenLists(list: ListState): void
  importTokenCallback(tokens: TokenWithLogo[]): void
}

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

interface WidgetMetadata {
  disableErc20: boolean
  tokenListCategoryState: TokenListCategoryState
  modalTitle: string
  chainsPanelTitle: string
}

export function useTokenAdminActions(): TokenAdminActions {
  const cowAnalytics = useCowAnalytics()

  const addCustomTokenLists = useAddList((source) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: 'Add List Success',
      label: source,
    })
  })
  const importTokenCallback = useAddUserToken()

  return { addCustomTokenLists, importTokenCallback }
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

export function useWidgetMetadata(
  field: Field,
  tradeType: TradeType | undefined,
  displayLpTokenLists: boolean | undefined,
  oppositeToken: Parameters<typeof getDefaultTokenListCategories>[1],
  lpTokensWithBalancesCount: number,
): WidgetMetadata {
  const disableErc20 = field === Field.OUTPUT && !!displayLpTokenLists
  const tokenListCategoryState: TokenListCategoryState = useState<TokenListCategory[] | null>(
    getDefaultTokenListCategories(field, oppositeToken, lpTokensWithBalancesCount),
  )
  const modalTitle = resolveModalTitle(field, tradeType)
  const chainsPanelTitle =
    field === Field.INPUT ? t`From network` : field === Field.OUTPUT ? t`To network` : t`Select network`

  return { disableErc20, tokenListCategoryState, modalTitle, chainsPanelTitle }
}

export function resolveModalTitle(field: Field, tradeType: TradeType | undefined): string {
  const isSwapTrade = !tradeType || tradeType === TradeType.SWAP

  if (field === Field.INPUT) {
    return isSwapTrade ? t`Swap from` : t`Sell token`
  }

  if (field === Field.OUTPUT) {
    return isSwapTrade ? t`Swap to` : t`Buy token`
  }

  return t`Select token`
}
