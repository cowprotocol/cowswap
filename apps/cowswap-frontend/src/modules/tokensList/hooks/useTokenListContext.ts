/**
 * useTokenListContext - Direct hook that combines token data from source hooks
 *
 * Replaces the atom hydration pattern. Components call this directly
 * instead of reading from a hydrated atom.
 */
import { TokenWithLogo } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

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

  // UI config
  hideFavoriteTokensTooltip: boolean
  selectedTargetChainId: number | undefined

  // Callbacks
  onClearRecentTokens: () => void
  onTokenListItemClick: (token: TokenWithLogo) => void

  // Context for token items
  selectTokenContext: SelectTokenContext
}

export function useTokenListContext(): TokenListContext {
  const { chainId: walletChainId } = useWalletInfo()
  const widgetState = useSelectTokenWidgetState()
  const tokensState = useTokensToSelect()
  const standalone = widgetState.standalone ?? false

  // Active chain for recent tokens
  const activeChainId = widgetState.selectedTargetChainId ?? walletChainId

  // Recent tokens section
  const { recentTokens, handleTokenListItemClick, clearRecentTokens } = useRecentTokenSection(
    tokensState.tokens,
    tokensState.favoriteTokens,
    activeChainId,
  )

  // Favorite tokens (empty in standalone mode)
  const favoriteTokens = standalone ? [] : tokensState.favoriteTokens

  // Build context for token list items
  const selectTokenContext = useSelectTokenContext({ onTokenListItemClick: handleTokenListItemClick })

  return {
    allTokens: tokensState.tokens,
    favoriteTokens,
    recentTokens,
    areTokensLoading: tokensState.isLoading,
    areTokensFromBridge: tokensState.areTokensFromBridge,
    hideFavoriteTokensTooltip: isInjectedWidget(),
    selectedTargetChainId: widgetState.selectedTargetChainId,
    onClearRecentTokens: clearRecentTokens,
    onTokenListItemClick: handleTokenListItemClick,
    selectTokenContext,
  }
}
