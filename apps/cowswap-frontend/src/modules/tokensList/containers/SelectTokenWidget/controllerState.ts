import { Dispatch, SetStateAction, useCallback, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { log } from '@cowprotocol/sdk-common'
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
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'

import { useTokensBalancesCombined } from 'modules/combinedBalances'
import { usePermitCompatibleTokens } from 'modules/permit'
import { TradeType } from 'modules/trade/types'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'

import { getDefaultTokenListCategories } from './getDefaultTokenListCategories'

import { persistRecentTokenSelection, useRecentTokens } from '../../hooks/useRecentTokens'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useTokensToSelect } from '../../hooks/useTokensToSelect'
import { ChainsToSelectState, TokenSelectionHandler } from '../../types'

import type { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

type UpdateSelectTokenWidgetFn = ReturnType<typeof useUpdateSelectTokenWidgetState>

export type TokenListCategoryState = [TokenListCategory[] | null, Dispatch<SetStateAction<TokenListCategory[] | null>>]

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

interface RecentTokenSection {
  recentTokens: TokenWithLogo[]
  handleTokenListItemClick(token: TokenWithLogo): void
  clearRecentTokens(): void
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

function resolveModalTitle(field: Field, tradeType: TradeType | undefined): string {
  const isSwapTrade = !tradeType || tradeType === TradeType.SWAP

  if (field === Field.INPUT) {
    return isSwapTrade ? t`Swap from` : t`Sell token`
  }

  if (field === Field.OUTPUT) {
    return isSwapTrade ? t`Swap to` : t`Buy token`
  }

  return t`Select token`
}

export function useDismissHandler(
  closeManageWidget: () => void,
  closeTokenSelectWidget: (options?: { overrideForceLock?: boolean }) => void,
): () => void {
  return useCallback(() => {
    closeManageWidget()
    closeTokenSelectWidget({ overrideForceLock: true })
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
  onSelectToken: TokenSelectionHandler | undefined,
  onDismiss: () => void,
  addCustomTokenLists: (list: ListState) => void,
  onTokenListAddingError: (error: Error) => void,
  updateSelectTokenWidget: UpdateSelectTokenWidgetFn,
  favoriteTokens: TokenWithLogo[],
): ImportFlowCallbacks {
  const importTokenAndClose = useCallback(
    (tokens: TokenWithLogo[]) => {
      importTokenCallback(tokens)
      const [selectedToken] = tokens

      if (selectedToken) {
        persistRecentTokenSelection(selectedToken, favoriteTokens)
        onSelectToken?.(selectedToken)
      }

      onDismiss()
    },
    [importTokenCallback, onSelectToken, onDismiss, favoriteTokens],
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

export function useRecentTokenSection(
  allTokens: TokenWithLogo[],
  favoriteTokens: TokenWithLogo[],
  activeChainId?: number,
): RecentTokenSection {
  const { recentTokens, addRecentToken, clearRecentTokens } = useRecentTokens({
    allTokens,
    favoriteTokens,
    activeChainId,
  })

  const handleTokenListItemClick = useCallback(
    (token: TokenWithLogo) => {
      addRecentToken(token)
    },
    [addRecentToken],
  )

  return { recentTokens, handleTokenListItemClick, clearRecentTokens }
}

export function useTokenSelectionHandler(
  onSelectToken: TokenSelectionHandler | undefined,
  widgetState: ReturnType<typeof useSelectTokenWidgetState>,
): TokenSelectionHandler {
  const { chainId: walletChainId } = useWalletInfo()
  const onSelectNetwork = useOnSelectNetwork()

  return useCallback(
    async (token: TokenWithLogo) => {
      const targetChainId = widgetState.selectedTargetChainId
      // SELL-side limit/TWAP orders must run on the picked network,
      // so nudge the wallet onto that chain before finalizing selection.
      const shouldSwitchWalletNetwork =
        widgetState.field === Field.INPUT &&
        (widgetState.tradeType === TradeType.LIMIT_ORDER || widgetState.tradeType === TradeType.ADVANCED_ORDERS) &&
        typeof targetChainId === 'number' &&
        targetChainId !== walletChainId

      if (shouldSwitchWalletNetwork && targetChainId in SupportedChainId) {
        try {
          await onSelectNetwork(targetChainId as SupportedChainId, true)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          log(`Failed to switch network after token selection: ${message}`)
        }
      }

      onSelectToken?.(token)
    },
    [
      onSelectToken,
      widgetState.field,
      widgetState.tradeType,
      widgetState.selectedTargetChainId,
      walletChainId,
      onSelectNetwork,
    ],
  )
}

export function hasAvailableChains(chainsToSelect: ChainsToSelectState | undefined): boolean {
  return Boolean(chainsToSelect)
}
