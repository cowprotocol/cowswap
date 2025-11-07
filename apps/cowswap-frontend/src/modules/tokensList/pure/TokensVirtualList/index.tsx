import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

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
  hideFavoriteTokensTooltip?: boolean
}

type TokensVirtualRow =
  | { type: 'favorite-section'; tokens: TokenWithLogo[]; hideTooltip?: boolean }
  | { type: 'title'; label: string }
  | { type: 'token'; token: TokenWithLogo }

export function TokensVirtualList(props: TokensVirtualListProps): ReactNode {
  const { allTokens, selectTokenContext, displayLpTokenLists, favoriteTokens, hideFavoriteTokensTooltip } = props
  const { values: balances } = selectTokenContext.balancesState

  const { isYieldEnabled } = useFeatureFlags()

  const sortedTokens = useMemo(() => {
    const listToSort = [...allTokens]
    return balances ? listToSort.sort(tokensListSorter(balances)) : listToSort
  }, [allTokens, balances])

  const rows = useMemo<TokensVirtualRow[]>(() => {
    const tokenRows = sortedTokens.map<TokensVirtualRow>((token) => ({ type: 'token', token }))

    if (favoriteTokens?.length) {
      return [
        { type: 'favorite-section', tokens: favoriteTokens, hideTooltip: hideFavoriteTokensTooltip },
        { type: 'title', label: 'All tokens' },
        ...tokenRows,
      ]
    }

    return tokenRows
  }, [favoriteTokens, hideFavoriteTokensTooltip, sortedTokens])

  const getItemView = useCallback(
    (rows: TokensVirtualRow[], virtualRow: VirtualItem) => {
      const row = rows[virtualRow.index]

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
    },
    [selectTokenContext],
  )

  return (
    <VirtualList id="tokens-list" items={rows} getItemView={getItemView}>
      {displayLpTokenLists || !isYieldEnabled ? null : <CoWAmmBanner isTokenSelectorView />}
    </VirtualList>
  )
}
