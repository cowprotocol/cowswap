import { Dispatch, SetStateAction, useCallback, useState } from 'react'

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

import { Field } from 'legacy/state/types'


import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { usePermitCompatibleTokens } from 'modules/permit'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { getDefaultTokenListCategories } from './getDefaultTokenListCategories'

import { useTokensToSelect } from '../../hooks/useTokensToSelect'
import { ChainsToSelectState } from '../../types'

import type { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

type UpdateSelectTokenWidgetFn = ReturnType<typeof useUpdateSelectTokenWidgetState>

export type TokenListCategoryState = [
  TokenListCategory[] | null,
  Dispatch<SetStateAction<TokenListCategory[] | null>>,
]

interface ManageWidgetVisibility {
  isManageWidgetOpen: boolean
  openManageWidget(): void
  closeManageWidget(): void
}

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

interface PoolPageHandlers {
  openPoolPage(poolAddress: string): void
  closePoolPage(): void
}

interface ImportFlowCallbacks {
  importTokenAndClose(tokens: TokenWithLogo[]): void
  importListAndBack(list: ListState): void
  resetTokenImport(): void
}

export function useManageWidgetVisibility(): ManageWidgetVisibility {
  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)

  const openManageWidget = useCallback(() => setIsManageWidgetOpen(true), [])
  const closeManageWidget = useCallback(() => setIsManageWidgetOpen(false), [])

  return { isManageWidgetOpen, openManageWidget, closeManageWidget }
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

  return {
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
  }
}

export function useWidgetMetadata(
  field: Field,
  displayLpTokenLists: boolean | undefined,
  oppositeToken: Parameters<typeof getDefaultTokenListCategories>[1],
  lpTokensWithBalancesCount: number,
): WidgetMetadata {
  const disableErc20 = field === Field.OUTPUT && !!displayLpTokenLists
  const tokenListCategoryState: TokenListCategoryState = useState<TokenListCategory[] | null>(
    getDefaultTokenListCategories(field, oppositeToken, lpTokensWithBalancesCount),
  )
  const modalTitle = field === Field.INPUT ? 'Swap from' : field === Field.OUTPUT ? 'Swap to' : 'Select token'
  const chainsPanelTitle =
    field === Field.INPUT ? 'From network' : field === Field.OUTPUT ? 'To network' : 'Select network'

  return { disableErc20, tokenListCategoryState, modalTitle, chainsPanelTitle }
}

export function useDismissHandler(
  closeManageWidget: () => void,
  closeTokenSelectWidget: () => void,
): () => void {
  return useCallback(() => {
    closeManageWidget()
    closeTokenSelectWidget()
  }, [closeManageWidget, closeTokenSelectWidget])
}

export function usePoolPageHandlers(updateSelectTokenWidget: UpdateSelectTokenWidgetFn): PoolPageHandlers {
  const openPoolPage = useCallback(
    (selectedPoolAddress: string) => {
      updateSelectTokenWidget({ selectedPoolAddress })
    },
    [updateSelectTokenWidget],
  )

  const closePoolPage = useCallback(() => {
    updateSelectTokenWidget({ selectedPoolAddress: undefined })
  }, [updateSelectTokenWidget])

  return { openPoolPage, closePoolPage }
}

export function useImportFlowCallbacks(
  importTokenCallback: ReturnType<typeof useAddUserToken>,
  onSelectToken: ((token: TokenWithLogo) => void) | undefined,
  onDismiss: () => void,
  addCustomTokenLists: (list: ListState) => void,
  onTokenListAddingError: (error: Error) => void,
  updateSelectTokenWidget: UpdateSelectTokenWidgetFn,
): ImportFlowCallbacks {
  const importTokenAndClose = useCallback(
    (tokens: TokenWithLogo[]) => {
      importTokenCallback(tokens)
      onSelectToken?.(tokens[0])
      onDismiss()
    },
    [importTokenCallback, onSelectToken, onDismiss],
  )

  const importListAndBack = useCallback(
    (list: ListState) => {
      try {
        addCustomTokenLists(list)
      } catch (error) {
        onDismiss()
        onTokenListAddingError(error as Error)
      }
      updateSelectTokenWidget({ listToImport: undefined })
    },
    [addCustomTokenLists, onDismiss, onTokenListAddingError, updateSelectTokenWidget],
  )

  const resetTokenImport = useCallback(() => {
    updateSelectTokenWidget({ tokenToImport: undefined })
  }, [updateSelectTokenWidget])

  return { importTokenAndClose, importListAndBack, resetTokenImport }
}

export function useTokenSelectionHandler(
  onSelectToken: ((token: TokenWithLogo) => void) | undefined,
): (token: TokenWithLogo) => void {
  return useCallback(
    (token: TokenWithLogo) => {
      onSelectToken?.(token)
    },
    [onSelectToken],
  )
}

export function hasAvailableChains(chainsToSelect: ChainsToSelectState | undefined): boolean {
  return Boolean(chainsToSelect)
}
