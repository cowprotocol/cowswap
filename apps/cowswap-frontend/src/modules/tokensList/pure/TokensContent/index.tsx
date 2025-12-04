import React, { ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Loader } from '@cowprotocol/ui'

import { TokenSearchResults } from '../../containers/TokenSearchResults'
import { SelectTokenContext } from '../../types'
import { getTokenUniqueKey } from '../../utils/tokenKey'
import * as styledEl from '../SelectTokenModal/styled'
import { TokensVirtualList } from '../TokensVirtualList'

export interface TokensContentProps {
  displayLpTokenLists?: boolean
  selectTokenContext: SelectTokenContext
  favoriteTokens: TokenWithLogo[]
  recentTokens?: TokenWithLogo[]
  areTokensLoading: boolean
  allTokens: TokenWithLogo[]
  searchInput: string
  areTokensFromBridge: boolean
  hideFavoriteTokensTooltip?: boolean
  selectedTargetChainId?: number
  onClearRecentTokens?: () => void
}

export function TokensContent({
  selectTokenContext,
  favoriteTokens,
  recentTokens,
  areTokensLoading,
  allTokens,
  displayLpTokenLists,
  searchInput,
  areTokensFromBridge,
  hideFavoriteTokensTooltip,
  selectedTargetChainId,
  onClearRecentTokens,
}: TokensContentProps): ReactNode {
  const shouldShowFavoritesInline = !areTokensLoading && !searchInput && favoriteTokens.length > 0
  const shouldShowRecentsInline = !areTokensLoading && !searchInput && (recentTokens?.length ?? 0) > 0

  const pinnedTokenKeys = useMemo(() => {
    // Only hide "Recent" tokens from the main list.
    // Favorite tokens should still appear in "All tokens" so they participate
    // in balance-based sorting and show their balances.
    if (!shouldShowRecentsInline) {
      return undefined
    }

    const pinned = new Set<string>()

    if (shouldShowRecentsInline && recentTokens) {
      recentTokens.forEach((token) => pinned.add(getTokenUniqueKey(token)))
    }

    return pinned
  }, [recentTokens, shouldShowRecentsInline])

  const tokensWithoutPinned = useMemo(() => {
    if (!pinnedTokenKeys) {
      return allTokens
    }

    return allTokens.filter((token) => !pinnedTokenKeys.has(getTokenUniqueKey(token)))
  }, [allTokens, pinnedTokenKeys])

  const favoriteTokensInline = shouldShowFavoritesInline ? favoriteTokens : undefined
  const recentTokensInline = shouldShowRecentsInline ? recentTokens : undefined

  return (
    <TokensView
      areTokensLoading={areTokensLoading}
      searchInput={searchInput}
      selectTokenContext={selectTokenContext}
      areTokensFromBridge={areTokensFromBridge}
      allTokens={allTokens}
      tokensWithoutPinned={tokensWithoutPinned}
      displayLpTokenLists={displayLpTokenLists}
      favoriteTokens={favoriteTokensInline}
      recentTokens={recentTokensInline}
      hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
      selectedTargetChainId={selectedTargetChainId}
      onClearRecentTokens={onClearRecentTokens}
    />
  )
}

interface TokensViewProps {
  areTokensLoading: boolean
  searchInput: string
  selectTokenContext: SelectTokenContext
  areTokensFromBridge: boolean
  allTokens: TokenWithLogo[]
  tokensWithoutPinned: TokenWithLogo[]
  displayLpTokenLists?: boolean
  favoriteTokens?: TokenWithLogo[]
  recentTokens?: TokenWithLogo[]
  hideFavoriteTokensTooltip?: boolean
  selectedTargetChainId?: number
  onClearRecentTokens?: () => void
}

function TokensView({
  areTokensLoading,
  searchInput,
  selectTokenContext,
  areTokensFromBridge,
  allTokens,
  tokensWithoutPinned,
  displayLpTokenLists,
  favoriteTokens,
  recentTokens,
  hideFavoriteTokensTooltip,
  selectedTargetChainId,
  onClearRecentTokens,
}: TokensViewProps): ReactNode {
  if (areTokensLoading) {
    return (
      <styledEl.TokensLoader>
        <Loader />
      </styledEl.TokensLoader>
    )
  }

  if (searchInput) {
    return (
      <TokenSearchResults
        searchInput={searchInput}
        selectTokenContext={selectTokenContext}
        areTokensFromBridge={areTokensFromBridge}
        allTokens={allTokens}
      />
    )
  }

  return (
    <TokensVirtualList
      selectTokenContext={selectTokenContext}
      allTokens={tokensWithoutPinned}
      displayLpTokenLists={displayLpTokenLists}
      favoriteTokens={favoriteTokens}
      recentTokens={recentTokens}
      hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
      scrollResetKey={selectedTargetChainId}
      onClearRecentTokens={onClearRecentTokens}
    />
  )
}
