import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'

import { VirtualItem } from '@tanstack/react-virtual'

import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { VirtualList } from 'common/pure/VirtualList'

import { SelectTokenContext } from '../../types'
import { tokensListSorter } from '../../utils/tokensListSorter'
import { FavoriteTokensList } from '../FavoriteTokensList'
import * as modalStyled from '../SelectTokenModal/styled'
import { TokenListItemContainer } from '../TokenListItemContainer'

export interface TokensVirtualListProps {
  allTokens: TokenWithLogo[]
  displayLpTokenLists?: boolean
  selectTokenContext: SelectTokenContext
  favoriteTokens?: TokenWithLogo[]
  recentTokens?: TokenWithLogo[]
  hideFavoriteTokensTooltip?: boolean
  scrollResetKey?: number
}

type TokensVirtualRow =
  | { type: 'favorite-section'; tokens: TokenWithLogo[]; hideTooltip?: boolean }
  | { type: 'title'; label: string }
  | { type: 'token'; token: TokenWithLogo }

export function TokensVirtualList(props: TokensVirtualListProps): ReactNode {
  const {
    allTokens,
    selectTokenContext,
    displayLpTokenLists,
    favoriteTokens,
    recentTokens,
    hideFavoriteTokensTooltip,
    scrollResetKey,
  } = props
  const { values: balances } = selectTokenContext.balancesState

  const { isYieldEnabled } = useFeatureFlags()

  const sortedTokens = useMemo(() => {
    if (!balances) {
      return allTokens
    }

    const prioritized: TokenWithLogo[] = []
    const remainder: TokenWithLogo[] = []

    for (const token of allTokens) {
      const hasBalance = Boolean(balances[token.address.toLowerCase()])
      if (hasBalance || getIsNativeToken(token)) {
        prioritized.push(token)
      } else {
        remainder.push(token)
      }
    }

    // Only sort the handful of tokens the user actually holds (plus natives) so large lists stay cheap to render.
    const sortedPrioritized =
      prioritized.length > 1 ? [...prioritized].sort(tokensListSorter(balances)) : prioritized

    return [...sortedPrioritized, ...remainder]
  }, [allTokens, balances])

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
      composedRows.push({ type: 'title', label: 'Recent' })
      recentTokens.forEach((token) => composedRows.push({ type: 'token', token }))
    }

    if (favoriteTokens?.length || recentTokens?.length) {
      composedRows.push({ type: 'title', label: 'All tokens' })
    }

    return [...composedRows, ...tokenRows]
  }, [favoriteTokens, hideFavoriteTokensTooltip, recentTokens, sortedTokens])

  const virtualListKey = scrollResetKey ?? 'tokens-list'

  const renderVirtualRow = useCallback(
    (virtualRows: TokensVirtualRow[], virtualItem: VirtualItem) => (
      <TokensVirtualRowRenderer row={virtualRows[virtualItem.index]} selectTokenContext={selectTokenContext} />
    ),
    [selectTokenContext],
  )

  return (
    <VirtualList
      key={virtualListKey}
      id="tokens-list"
      items={rows}
      getItemView={renderVirtualRow}
      scrollResetKey={scrollResetKey}
    >
      {displayLpTokenLists || !isYieldEnabled ? null : <CoWAmmBanner isTokenSelectorView />}
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
        <FavoriteTokensList
          tokens={row.tokens}
          selectTokenContext={selectTokenContext}
          hideTooltip={row.hideTooltip}
        />
      )
    case 'title':
      return <modalStyled.ListTitle>{row.label}</modalStyled.ListTitle>
    default:
      return <TokenListItemContainer token={row.token} context={selectTokenContext} />
  }
}
