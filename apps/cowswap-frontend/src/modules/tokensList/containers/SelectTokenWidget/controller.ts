/**
 * SelectTokenWidget Controller
 *
 * Minimal controller - just handles widget visibility and atom hydration.
 * Domain-specific logic is handled by focused hooks in each slot.
 */
import { useWalletInfo } from '@cowprotocol/wallet'

import { useHydrateTokenListViewAtom } from './controllerAtomHydration'
import { useWidgetOpenState } from './hooks'
import { useTokenDataSources } from './tokenDataHooks'
import { useRecentTokenSection, useTokenSelectionHandler } from './tokenSelectionHooks'

export interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

export interface SelectTokenWidgetController {
  isOpen: boolean
}

export function useSelectTokenWidgetController({
  displayLpTokenLists,
  standalone,
}: SelectTokenWidgetProps): SelectTokenWidgetController {
  const { isOpen, widgetState } = useWidgetOpenState()
  const { account, chainId: walletChainId } = useWalletInfo()
  const tokenData = useTokenDataSources()

  // Token selection handler
  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)

  // Recent tokens
  const activeChainId = widgetState.selectedTargetChainId ?? walletChainId
  const { recentTokens, handleTokenListItemClick, clearRecentTokens } = useRecentTokenSection(
    tokenData.allTokens,
    tokenData.favoriteTokens,
    activeChainId,
  )

  // Favorite tokens (empty in standalone mode)
  const favoriteTokens = standalone ? [] : tokenData.favoriteTokens

  // Hydrate token list atom (only when open)
  useHydrateTokenListViewAtom({
    shouldRender: isOpen,
    tokenData,
    widgetState,
    favoriteTokens,
    recentTokens,
    onClearRecentTokens: clearRecentTokens,
    onTokenListItemClick: handleTokenListItemClick,
    handleSelectToken,
    account,
    displayLpTokenLists: displayLpTokenLists ?? false,
  })

  return { isOpen }
}
