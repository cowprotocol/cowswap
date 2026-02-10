import { ReactNode, useMemo } from 'react'

import { getTokenId } from '@cowprotocol/cow-sdk'
import { Loader } from '@cowprotocol/ui'

import { TokenSearchResults } from '../../containers/TokenSearchResults'
import { useTokenListContext } from '../../hooks/useTokenListContext'
import { useTokenListViewState } from '../../hooks/useTokenListViewState'
import * as styledEl from '../SelectTokenModal/styled'
import { TokensVirtualList } from '../TokensVirtualList'

export function TokensContent(): ReactNode {
  // UI state (searchInput) from atom
  const { searchInput } = useTokenListViewState()

  // Token data directly from source hooks
  const { favoriteTokens, recentTokens, areTokensLoading, allTokens, onClearRecentTokens } = useTokenListContext()

  const shouldShowFavoritesInline = !areTokensLoading && !searchInput && favoriteTokens.length > 0
  const shouldShowRecentsInline = !areTokensLoading && !searchInput && recentTokens.length > 0

  const pinnedTokenKeys = useMemo(() => {
    // Only hide "Recent" tokens from the main list.
    // Favorite tokens should still appear in "All tokens" so they participate
    // in balance-based sorting and show their balances.
    if (!shouldShowRecentsInline) {
      return undefined
    }

    const pinned = new Set<string>()

    if (shouldShowRecentsInline && recentTokens) {
      recentTokens.forEach((token) => pinned.add(getTokenId(token)))
    }

    return pinned
  }, [recentTokens, shouldShowRecentsInline])

  const tokensWithoutPinned = useMemo(() => {
    if (!pinnedTokenKeys) {
      return allTokens
    }

    return allTokens.filter((token) => !pinnedTokenKeys.has(getTokenId(token)))
  }, [allTokens, pinnedTokenKeys])

  const favoriteTokensInline = shouldShowFavoritesInline ? favoriteTokens : undefined
  const recentTokensInline = shouldShowRecentsInline ? recentTokens : undefined

  if (areTokensLoading) {
    return (
      <styledEl.TokensLoader>
        <Loader />
      </styledEl.TokensLoader>
    )
  }

  if (searchInput) {
    return <TokenSearchResults />
  }

  return (
    <TokensVirtualList
      tokensToDisplay={tokensWithoutPinned}
      favoriteTokens={favoriteTokensInline}
      recentTokens={recentTokensInline}
      onClearRecentTokens={onClearRecentTokens}
    />
  )
}
