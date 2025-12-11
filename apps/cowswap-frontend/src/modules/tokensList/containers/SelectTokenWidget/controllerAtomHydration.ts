import { useHydrateAtoms } from 'jotai/utils'
import { useLayoutEffect, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { useUpdateTokenListViewState } from '../../hooks/useUpdateTokenListViewState'
import { tokenListViewAtom, TokenListViewState } from '../../state/tokenListViewAtom'
import { SelectTokenContext } from '../../types'

import type { TokenDataSources } from './tokenDataHooks'
import type { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'

interface HydrateTokenListViewAtomArgs {
  shouldRender: boolean
  tokenData: TokenDataSources
  widgetState: ReturnType<typeof useSelectTokenWidgetState>
  favoriteTokens: TokenWithLogo[]
  recentTokens: TokenWithLogo[] | undefined
  onClearRecentTokens: (() => void) | undefined
  onTokenListItemClick: ((token: TokenWithLogo) => void) | undefined
  handleSelectToken: (token: TokenWithLogo) => Promise<void> | void
  account: string | undefined
  displayLpTokenLists: boolean
}

/**
 * Hydrates the tokenListViewAtom at the controller level.
 * This moves hydration responsibility from SelectTokenModal to the controller,
 * allowing the modal to receive fewer props while children read from the atom.
 *
 * Only hydrates when shouldRender is true to avoid unnecessary atom writes
 * when the modal isn't supposed to be displayed.
 */
export function useHydrateTokenListViewAtom({
  shouldRender,
  tokenData,
  widgetState,
  favoriteTokens,
  recentTokens,
  onClearRecentTokens,
  onTokenListItemClick,
  handleSelectToken,
  account,
  displayLpTokenLists,
}: HydrateTokenListViewAtomArgs): void {
  const updateTokenListView = useUpdateTokenListViewState()

  // Build the selectTokenContext object
  const selectTokenContext: SelectTokenContext = useMemo(
    () => ({
      balancesState: tokenData.balancesState,
      selectedToken: widgetState.selectedToken,
      onSelectToken: handleSelectToken,
      onTokenListItemClick,
      unsupportedTokens: tokenData.unsupportedTokens,
      permitCompatibleTokens: tokenData.permitCompatibleTokens,
      tokenListTags: tokenData.tokenListTags,
      isWalletConnected: !!account,
    }),
    [
      tokenData.balancesState,
      widgetState.selectedToken,
      handleSelectToken,
      onTokenListItemClick,
      tokenData.unsupportedTokens,
      tokenData.permitCompatibleTokens,
      tokenData.tokenListTags,
      account,
    ],
  )

  // Compute the full view state to hydrate
  // Note: searchInput is handled by the modal (local state + sync effect)
  const viewState: Omit<TokenListViewState, 'searchInput'> = useMemo(
    () => ({
      allTokens: tokenData.allTokens,
      favoriteTokens,
      recentTokens,
      areTokensLoading: tokenData.areTokensLoading,
      areTokensFromBridge: tokenData.areTokensFromBridge,
      hideFavoriteTokensTooltip: isInjectedWidget(),
      selectedTargetChainId: widgetState.selectedTargetChainId,
      selectTokenContext,
      onClearRecentTokens,
      displayLpTokenLists,
    }),
    [
      tokenData.allTokens,
      favoriteTokens,
      recentTokens,
      tokenData.areTokensLoading,
      tokenData.areTokensFromBridge,
      widgetState.selectedTargetChainId,
      selectTokenContext,
      onClearRecentTokens,
      displayLpTokenLists,
    ],
  )

  // Hydrate atom SYNCHRONOUSLY on first render (only when modal should render)
  useHydrateAtoms(shouldRender ? [[tokenListViewAtom, { ...viewState, searchInput: '' }]] : [])

  // Keep atom in sync when data changes (after initial render)
  // Using useLayoutEffect to ensure atom is updated before paint, avoiding flicker
  // Skip when modal isn't rendered to avoid unnecessary atom writes
  useLayoutEffect(() => {
    if (shouldRender) {
      updateTokenListView(viewState)
    }
  }, [shouldRender, viewState, updateTokenListView])
}
