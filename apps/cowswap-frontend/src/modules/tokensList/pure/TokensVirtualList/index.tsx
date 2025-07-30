import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { VirtualItem } from '@tanstack/react-virtual'

import { CoWAmmBanner } from 'common/containers/CoWAmmBanner'
import { VirtualList } from 'common/pure/VirtualList'

import { SelectTokenContext } from '../../types'
import { tokensListSorter } from '../../utils/tokensListSorter'
import { TokenListItemContainer } from '../TokenListItemContainer'

export interface TokensVirtualListProps {
  allTokens: TokenWithLogo[]
  displayLpTokenLists?: boolean
  selectTokenContext: SelectTokenContext
}

export function TokensVirtualList(props: TokensVirtualListProps): ReactNode {
  const { allTokens, selectTokenContext, displayLpTokenLists } = props
  const { values: balances } = selectTokenContext.balancesState

  const { isYieldEnabled } = useFeatureFlags()

  const sortedTokens = useMemo(
    () => (balances ? allTokens.sort(tokensListSorter(balances)) : allTokens),
    [allTokens, balances],
  )

  const getItemView = useCallback(
    (sortedTokens: TokenWithLogo[], virtualRow: VirtualItem) => {
      const token = sortedTokens[virtualRow.index]

      return <TokenListItemContainer key={token.address} token={token} context={selectTokenContext} />
    },
    [selectTokenContext],
  )

  return (
    <VirtualList id="tokens-list" items={sortedTokens} getItemView={getItemView}>
      {displayLpTokenLists || !isYieldEnabled ? null : <CoWAmmBanner isTokenSelectorView />}
    </VirtualList>
  )
}
