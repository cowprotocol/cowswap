import React, { ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Loader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Edit } from 'react-feather'

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
  hideFavoriteTokensTooltip?: boolean
  areTokensLoading: boolean
  allTokens: TokenWithLogo[]
  searchInput: string
  standalone?: boolean
  areTokensFromBridge: boolean
  selectedTargetChainId?: number
  onOpenManageWidget(): void
  onClearRecentTokens?: () => void
}

export function TokensContent({
  selectTokenContext,
  favoriteTokens,
  recentTokens,
  hideFavoriteTokensTooltip,
  areTokensLoading,
  allTokens,
  displayLpTokenLists,
  searchInput,
  standalone,
  areTokensFromBridge,
  selectedTargetChainId,
  onOpenManageWidget,
  onClearRecentTokens,
}: TokensContentProps): ReactNode {
  const shouldShowFavoritesInline = !areTokensLoading && !searchInput && favoriteTokens.length > 0
  const shouldShowRecentsInline = !areTokensLoading && !searchInput && (recentTokens?.length ?? 0) > 0

  const favoriteTokensInline = shouldShowFavoritesInline ? favoriteTokens : undefined
  const recentTokensInline = shouldShowRecentsInline ? recentTokens : undefined

  const pinnedTokenKeys = useMemo(() => {
    if (!shouldShowFavoritesInline && !shouldShowRecentsInline) {
      return undefined
    }

    const pinned = new Set<string>()

    if (shouldShowFavoritesInline) {
      favoriteTokens.forEach((token) => pinned.add(getTokenUniqueKey(token)))
    }

    if (shouldShowRecentsInline && recentTokensInline) {
      recentTokensInline.forEach((token) => pinned.add(getTokenUniqueKey(token)))
    }

    return pinned
  }, [favoriteTokens, recentTokensInline, shouldShowFavoritesInline, shouldShowRecentsInline])

  const tokensWithoutPinned = useMemo(() => {
    if (!pinnedTokenKeys) {
      return allTokens
    }

    return allTokens.filter((token) => !pinnedTokenKeys.has(getTokenUniqueKey(token)))
  }, [allTokens, pinnedTokenKeys])

  return (
    <>
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
      {!standalone && (
        <>
          <styledEl.Separator />
          <div>
            <styledEl.ActionButton id="list-token-manage-button" onClick={onOpenManageWidget}>
              <Edit />{' '}
              <span>
                <Trans>Manage Token Lists</Trans>
              </span>
            </styledEl.ActionButton>
          </div>
        </>
      )}
    </>
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
