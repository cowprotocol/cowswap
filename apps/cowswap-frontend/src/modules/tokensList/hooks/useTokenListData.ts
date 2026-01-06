/**
 * useTokenListData - Direct hook that combines token data from source hooks
 *
 * Replaces the atom hydration pattern. Components call this directly
 * instead of reading from a hydrated atom.
 */
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { useTokenDataSources } from '../containers/SelectTokenWidget/tokenDataHooks'
import { useRecentTokenSection, useTokenSelectionHandler } from '../containers/SelectTokenWidget/tokenSelectionHooks'
import { SelectTokenContext } from '../types'

export interface TokenListData {
  // Token lists
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  recentTokens: TokenWithLogo[]

  // Loading state
  areTokensLoading: boolean
  areTokensFromBridge: boolean

  // UI config
  hideFavoriteTokensTooltip: boolean
  selectedTargetChainId: number | undefined

  // Callbacks
  onClearRecentTokens: () => void
  onTokenListItemClick: (token: TokenWithLogo) => void

  // Context for token items
  selectTokenContext: SelectTokenContext
}

interface UseTokenListDataOptions {
  standalone?: boolean
}

export function useTokenListData(options: UseTokenListDataOptions = {}): TokenListData {
  const { standalone = false } = options
  const { account, chainId: walletChainId } = useWalletInfo()
  const widgetState = useSelectTokenWidgetState()
  const tokenData = useTokenDataSources()

  // Token selection handler (wraps widgetState.onSelectToken with network switching logic)
  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)

  // Active chain for recent tokens
  const activeChainId = widgetState.selectedTargetChainId ?? walletChainId

  // Recent tokens section
  const { recentTokens, handleTokenListItemClick, clearRecentTokens } = useRecentTokenSection(
    tokenData.allTokens,
    tokenData.favoriteTokens,
    activeChainId,
  )

  // Favorite tokens (empty in standalone mode)
  const favoriteTokens = standalone ? [] : tokenData.favoriteTokens

  // Build context for token list items
  const selectTokenContext: SelectTokenContext = useMemo(
    () => ({
      balancesState: tokenData.balancesState,
      selectedToken: widgetState.selectedToken,
      onSelectToken: handleSelectToken,
      onTokenListItemClick: handleTokenListItemClick,
      unsupportedTokens: tokenData.unsupportedTokens,
      permitCompatibleTokens: tokenData.permitCompatibleTokens,
      tokenListTags: tokenData.tokenListTags,
      isWalletConnected: !!account,
    }),
    [
      tokenData.balancesState,
      widgetState.selectedToken,
      handleSelectToken,
      handleTokenListItemClick,
      tokenData.unsupportedTokens,
      tokenData.permitCompatibleTokens,
      tokenData.tokenListTags,
      account,
    ],
  )

  return {
    allTokens: tokenData.allTokens,
    favoriteTokens,
    recentTokens,
    areTokensLoading: tokenData.areTokensLoading,
    areTokensFromBridge: tokenData.areTokensFromBridge,
    hideFavoriteTokensTooltip: isInjectedWidget(),
    selectedTargetChainId: widgetState.selectedTargetChainId,
    onClearRecentTokens: clearRecentTokens,
    onTokenListItemClick: handleTokenListItemClick,
    selectTokenContext,
  }
}
