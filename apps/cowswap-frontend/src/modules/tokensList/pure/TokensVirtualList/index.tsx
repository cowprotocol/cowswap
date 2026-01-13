import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { VirtualItem } from '@tanstack/react-virtual'

import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { VirtualList } from 'common/pure/VirtualList'

import { buildVirtualRows, sortTokensByBalance } from './tokensVirtualListUtils'
import { TokensVirtualRowRenderer } from './TokensVirtualRowRenderer'
import { TokensVirtualRow } from './types'

import { useTokenListData } from '../../hooks/useTokenListData'

export interface TokensVirtualListProps {
  tokensToDisplay: TokenWithLogo[]
  favoriteTokens?: TokenWithLogo[]
  recentTokens?: TokenWithLogo[]
  onClearRecentTokens: () => void
}

export function TokensVirtualList({
  tokensToDisplay,
  favoriteTokens,
  recentTokens,
  onClearRecentTokens,
}: TokensVirtualListProps): ReactNode {
  const { selectTokenContext, hideFavoriteTokensTooltip, selectedTargetChainId } = useTokenListData()
  const { values: balances } = selectTokenContext.balancesState
  const { isYieldEnabled } = useFeatureFlags()

  const sortedTokens = useMemo(() => sortTokensByBalance(tokensToDisplay, balances), [tokensToDisplay, balances])

  const rows = useMemo<TokensVirtualRow[]>(
    () =>
      buildVirtualRows({
        sortedTokens,
        favoriteTokens,
        recentTokens,
        hideFavoriteTokensTooltip,
        onClearRecentTokens,
      }),
    [favoriteTokens, hideFavoriteTokensTooltip, onClearRecentTokens, recentTokens, sortedTokens],
  )

  const getItemView = useCallback(
    (virtualRows: TokensVirtualRow[], virtualItem: VirtualItem) => (
      <TokensVirtualRowRenderer row={virtualRows[virtualItem.index]} selectTokenContext={selectTokenContext} />
    ),
    [selectTokenContext],
  )

  const virtualListKey = selectedTargetChainId ?? 'tokens-list'

  return (
    <VirtualList
      key={virtualListKey}
      id="tokens-list"
      items={rows}
      getItemView={getItemView}
      scrollResetKey={selectedTargetChainId}
    >
      {isYieldEnabled ? <CoWAmmBanner isTokenSelectorView /> : null}
    </VirtualList>
  )
}
