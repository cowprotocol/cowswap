import { ReactNode, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { Loader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { VirtualItem } from '@tanstack/react-virtual'

import { VirtualList } from 'common/pure/VirtualList'

import { TokenSearchRowRenderer } from './TokenSearchRowRenderer'
import { TokenSearchContentProps, TokenSearchRow } from './types'
import { useSearchRows } from './useSearchRows'

import * as styledEl from '../../containers/TokenSearchResults/styled'

export function TokenSearchContent({
  searchInput,
  searchResults,
  importToken,
  selectTokenContext,
}: TokenSearchContentProps): ReactNode {
  const { inactiveListsResult, blockchainResult, activeListsResult, externalApiResult, isLoading } = searchResults

  const searchCount = [
    activeListsResult.length,
    inactiveListsResult?.length ?? 0,
    blockchainResult?.length ?? 0,
    externalApiResult?.length ?? 0,
  ].reduce<number>((acc, cur) => acc + cur, 0)

  const isTokenNotFound = isLoading ? false : searchCount === 0

  const [matchedTokens, activeList] = useMemo(() => {
    const matched: TokenWithLogo[] = []
    const remaining: TokenWithLogo[] = []

    for (const t of activeListsResult) {
      if (doesTokenMatchSymbolOrAddress(t, searchInput)) {
        matched.push(t)
      } else {
        remaining.push(t)
      }
    }

    return [matched, remaining]
  }, [activeListsResult, searchInput])

  const rows = useSearchRows({
    isLoading,
    matchedTokens,
    activeList,
    blockchainResult,
    inactiveListsResult,
    externalApiResult,
  })

  const getItemView = useCallback(
    (items: TokenSearchRow[], virtualItem: VirtualItem) => (
      <TokenSearchRowRenderer
        row={items[virtualItem.index]}
        selectTokenContext={selectTokenContext}
        importToken={importToken}
      />
    ),
    [importToken, selectTokenContext],
  )

  if (isLoading)
    return (
      <styledEl.LoaderWrapper>
        <Loader />
      </styledEl.LoaderWrapper>
    )

  if (isTokenNotFound)
    return (
      <styledEl.TokenNotFound>
        <Trans>No tokens found</Trans>
      </styledEl.TokenNotFound>
    )

  return <VirtualList id="token-search-results" items={rows} getItemView={getItemView} scrollResetKey={searchInput} />
}
