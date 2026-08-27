import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useRecentTokens } from '../../../hooks/useRecentTokens'

export interface RecentTokenSection {
  recentTokens: TokenWithLogo[]
  handleTokenListItemClick(token: TokenWithLogo): void
  clearRecentTokens(): void
}

export function useRecentTokenSection(
  allTokens: TokenWithLogo[],
  favoriteTokens: TokenWithLogo[],
  activeChainId?: number,
  allowedTokens?: TokenWithLogo[],
): RecentTokenSection {
  const { recentTokens, addRecentToken, clearRecentTokens } = useRecentTokens({
    allTokens,
    favoriteTokens,
    allowedTokens,
    activeChainId,
  })

  const handleTokenListItemClick = useCallback(
    (token: TokenWithLogo) => {
      addRecentToken(token)
    },
    [addRecentToken],
  )

  return useMemo(
    () => ({ recentTokens, handleTokenListItemClick, clearRecentTokens }),
    [recentTokens, handleTokenListItemClick, clearRecentTokens],
  )
}
