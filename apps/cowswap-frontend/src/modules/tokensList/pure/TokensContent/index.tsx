import React, { ReactNode, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Loader } from '@cowprotocol/ui'

import { TokenSearchResults } from '../../containers/TokenSearchResults'
import { SelectTokenContext } from '../../types'
import * as styledEl from '../SelectTokenModal/styled'
import { TokensVirtualList } from '../TokensVirtualList'

export interface TokensContentProps {
  displayLpTokenLists?: boolean
  selectTokenContext: SelectTokenContext
  favoriteTokens: TokenWithLogo[]
  areTokensLoading: boolean
  allTokens: TokenWithLogo[]
  searchInput: string
  areTokensFromBridge: boolean
  hideFavoriteTokensTooltip?: boolean
  selectedTargetChainId?: number
}

export function TokensContent({
  selectTokenContext,
  favoriteTokens,
  areTokensLoading,
  allTokens,
  displayLpTokenLists,
  searchInput,
  areTokensFromBridge,
  hideFavoriteTokensTooltip,
  selectedTargetChainId,
}: TokensContentProps): ReactNode {
  const shouldShowFavoritesInline = !areTokensLoading && !searchInput && favoriteTokens.length > 0

  const favoriteAddresses = useMemo(() => {
    if (!shouldShowFavoritesInline) {
      return undefined
    }

    return new Set(favoriteTokens.map((token) => token.address.toLowerCase()))
  }, [favoriteTokens, shouldShowFavoritesInline])

  const tokensWithoutFavorites = useMemo(() => {
    if (!favoriteAddresses) {
      return allTokens
    }

    return allTokens.filter((token) => !favoriteAddresses.has(token.address.toLowerCase()))
  }, [allTokens, favoriteAddresses])

  const favoriteTokensInline = shouldShowFavoritesInline ? favoriteTokens : undefined

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
              allTokens={tokensWithoutFavorites}
              displayLpTokenLists={displayLpTokenLists}
              favoriteTokens={favoriteTokensInline}
              hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
              scrollResetKey={selectedTargetChainId}
            />
          )}
        </>
      )}
    </>
  )
}
