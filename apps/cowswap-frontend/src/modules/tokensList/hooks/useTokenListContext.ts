/**
 * useTokenListContext - Direct hook that combines token data from source hooks
 *
 * Replaces the atom hydration pattern. Components call this directly
 * instead of reading from a hydrated atom.
 */
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { ChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useChainsToSelect } from './useChainsToSelect'
import { useSelectTokenContext } from './useSelectTokenContext'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useTokensToSelect } from './useTokensToSelect'

import { useRecentTokenSection } from '../containers/SelectTokenWidget/hooks/useRecentTokenSection'
import { SelectTokenContext } from '../types'

export interface TokenListContext {
  // Token lists
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  recentTokens: TokenWithLogo[]

  // Loading state
  areTokensLoading: boolean
  areTokensFromBridge: boolean

  // Bridge support map (null when loading, populated when bridge tokens are fetched)
  bridgeSupportedTokensMap: Record<string, boolean> | null

  // UI config
  hideFavoriteTokensTooltip: boolean
  selectedTargetChainId: ChainId | undefined

  // Callbacks
  onClearRecentTokens: () => void
  onTokenListItemClick: (token: TokenWithLogo) => void

  // Context for token items
  selectTokenContext: SelectTokenContext
}

export function useTokenListContext(): TokenListContext {
  const { chainId: walletChainId } = useWalletInfo()
  const widgetState = useSelectTokenWidgetState()
  const chainsToSelect = useChainsToSelect()
  const tokensState = useTokensToSelect()
  const standalone = widgetState.standalone ?? false
  const selectedTargetChainId = chainsToSelect?.defaultChainId ?? widgetState.selectedTargetChainId

  // Active chain for recent tokens
  const activeChainId = selectedTargetChainId ?? walletChainId

  // Recent tokens section
  const { recentTokens, handleTokenListItemClick, clearRecentTokens } = useRecentTokenSection(
    tokensState.tokens,
    tokensState.favoriteTokens,
    activeChainId,
  )

  // Favorite tokens (empty in standalone mode)
  const favoriteTokens = useMemo(
    () => (standalone ? [] : tokensState.favoriteTokens),
    [standalone, tokensState.favoriteTokens],
  )

  // Build context for token list items
  const selectTokenContext = useSelectTokenContext({ onTokenListItemClick: handleTokenListItemClick })

  return useMemo(
    () => ({
      allTokens: tokensState.tokens,
      favoriteTokens,
      recentTokens,
      areTokensLoading: tokensState.isLoading,
      areTokensFromBridge: tokensState.areTokensFromBridge,
      bridgeSupportedTokensMap: tokensState.bridgeSupportedTokensMap,
      hideFavoriteTokensTooltip: isInjectedWidget(),
      selectedTargetChainId,
      onClearRecentTokens: clearRecentTokens,
      onTokenListItemClick: handleTokenListItemClick,
      selectTokenContext,
    }),
    [
      tokensState.tokens,
      tokensState.isLoading,
      tokensState.areTokensFromBridge,
      tokensState.bridgeSupportedTokensMap,
      favoriteTokens,
      recentTokens,
      selectedTargetChainId,
      clearRecentTokens,
      handleTokenListItemClick,
      selectTokenContext,
    ],
  )
}
