import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
import { VirtualItem } from '@tanstack/react-virtual'

import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { VirtualList } from 'common/pure/VirtualList'

import { useTokenListData } from '../../hooks/useTokenListData'
import { SelectTokenContext } from '../../types'
import { tokensListSorter } from '../../utils/tokensListSorter'
import { FavoriteTokensList } from '../FavoriteTokensList'
import * as modalStyled from '../SelectTokenModal/styled'
import { TokenListItemContainer } from '../TokenListItemContainer'

export interface TokensVirtualListProps {
  tokensToDisplay: TokenWithLogo[] // Pre-filtered by parent
  favoriteTokens?: TokenWithLogo[]
  recentTokens?: TokenWithLogo[]
  onClearRecentTokens: () => void
}

type TokensVirtualRow =
  | { type: 'favorite-section'; tokens: TokenWithLogo[]; hideTooltip?: boolean }
  | { type: 'title'; label: string; actionLabel?: string; onAction?: () => void }
  | { type: 'token'; token: TokenWithLogo }

export function TokensVirtualList({
  tokensToDisplay,
  favoriteTokens,
  recentTokens,
  onClearRecentTokens,
}: TokensVirtualListProps): ReactNode {
  const { selectTokenContext, hideFavoriteTokensTooltip, selectedTargetChainId } = useTokenListData()

  const { values: balances } = selectTokenContext.balancesState

  const { isYieldEnabled } = useFeatureFlags()

  const sortedTokens = useMemo(() => {
    if (!balances) {
      return tokensToDisplay
    }

    const prioritized: TokenWithLogo[] = []
    const remainder: TokenWithLogo[] = []

    for (const token of tokensToDisplay) {
      const hasBalance = Boolean(balances[token.address.toLowerCase()])
      if (hasBalance || getIsNativeToken(token)) {
        prioritized.push(token)
      } else {
        remainder.push(token)
      }
    }

    const sortedPrioritized = prioritized.length > 1 ? [...prioritized].sort(tokensListSorter(balances)) : prioritized

    return [...sortedPrioritized, ...remainder]
  }, [tokensToDisplay, balances])

  const rows = useMemo<TokensVirtualRow[]>(() => {
    const tokenRows = sortedTokens.map<TokensVirtualRow>((token) => ({ type: 'token', token }))
    const composedRows: TokensVirtualRow[] = []

    if (favoriteTokens?.length) {
      composedRows.push({
        type: 'favorite-section',
        tokens: favoriteTokens,
        hideTooltip: hideFavoriteTokensTooltip,
      })
    }

    if (recentTokens?.length) {
      composedRows.push({
        type: 'title',
        label: t`Recent`,
        actionLabel: t`Clear`,
        onAction: onClearRecentTokens,
      })
      recentTokens.forEach((token) => composedRows.push({ type: 'token', token }))
    }

    if (favoriteTokens?.length || recentTokens?.length) {
      composedRows.push({ type: 'title', label: t`All tokens` })
    }

    return [...composedRows, ...tokenRows]
  }, [favoriteTokens, hideFavoriteTokensTooltip, onClearRecentTokens, recentTokens, sortedTokens])

  const virtualListKey = selectedTargetChainId ?? 'tokens-list'

  const getItemView = useCallback(
    (virtualRows: TokensVirtualRow[], virtualItem: VirtualItem) => (
      <TokensVirtualRowRenderer row={virtualRows[virtualItem.index]} selectTokenContext={selectTokenContext} />
    ),
    [selectTokenContext],
  )

  // Check if LP token lists are displayed (no CoWAmmBanner in that case)
  // This was previously read from atom, now we don't have it - default to not showing banner for LP
  const showCoWAmmBanner = isYieldEnabled

  return (
    <VirtualList
      key={virtualListKey}
      id="tokens-list"
      items={rows}
      getItemView={getItemView}
      scrollResetKey={selectedTargetChainId}
    >
      {showCoWAmmBanner ? <CoWAmmBanner isTokenSelectorView /> : null}
    </VirtualList>
  )
}

interface TokensVirtualRowRendererProps {
  row: TokensVirtualRow
  selectTokenContext: SelectTokenContext
}

function TokensVirtualRowRenderer({ row, selectTokenContext }: TokensVirtualRowRendererProps): ReactNode {
  switch (row.type) {
    case 'favorite-section':
      return (
        <FavoriteTokensList tokens={row.tokens} selectTokenContext={selectTokenContext} hideTooltip={row.hideTooltip} />
      )
    case 'title':
      return (
        <modalStyled.ListTitle>
          <span>{row.label}</span>
          {row.actionLabel && row.onAction ? (
            <modalStyled.ListTitleActionButton type="button" onClick={row.onAction}>
              {row.actionLabel}
            </modalStyled.ListTitleActionButton>
          ) : null}
        </modalStyled.ListTitle>
      )
    default:
      return <TokenListItemContainer token={row.token} context={selectTokenContext} />
  }
}
