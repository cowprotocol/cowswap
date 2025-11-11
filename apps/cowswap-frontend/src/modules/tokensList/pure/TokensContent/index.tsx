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
    if (!shouldShowFavoritesInline && !shouldShowRecentsInline) {
      return undefined
    }

    const pinned = new Set<string>()

    if (shouldShowFavoritesInline) {
      favoriteTokens.forEach((token) => pinned.add(getTokenUniqueKey(token)))
    }

    if (shouldShowRecentsInline && recentTokens) {
      recentTokens.forEach((token) => pinned.add(getTokenUniqueKey(token)))
    }

    return pinned
  }, [favoriteTokens, recentTokens, shouldShowFavoritesInline, shouldShowRecentsInline])

  const tokensWithoutPinned = useMemo(() => {
    if (!pinnedTokenKeys) {
      return allTokens
    }

    return allTokens.filter((token) => !pinnedTokenKeys.has(getTokenUniqueKey(token)))
  }, [allTokens, pinnedTokenKeys])

  const favoriteTokensInline = shouldShowFavoritesInline ? favoriteTokens : undefined
  const recentTokensInline = shouldShowRecentsInline ? recentTokens : undefined

  return (
    <>
      {areTokensLoading ? (
        <styledEl.TokensLoader>
          <Loader />
        </styledEl.TokensLoader>
      ) : (
        <>
          {searchInput ? (
            <TokenSearchResults
              searchInput={searchInput}
              selectTokenContext={selectTokenContext}
              areTokensFromBridge={areTokensFromBridge}
              allTokens={allTokens}
            />
          ) : (
            <TokensVirtualList
              selectTokenContext={selectTokenContext}
              allTokens={tokensWithoutPinned}
              displayLpTokenLists={displayLpTokenLists}
              favoriteTokens={favoriteTokensInline}
              recentTokens={recentTokensInline}
              hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
              scrollResetKey={selectedTargetChainId}
              onClearRecentTokens={onClearRecentTokens}
            />
          )}
        </>
      )}
    </>
  )
}
