import { ReactNode, useCallback, useEffect, useMemo } from 'react'

import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { getTokenSearchFilter, TokenSearchResponse, useSearchToken } from '@cowprotocol/tokens'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { useTokenListData } from '../../hooks/useTokenListData'
import { useTokenListViewState } from '../../hooks/useTokenListViewState'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'
import { CommonListContainer } from '../../pure/commonElements'
import { TokenSearchContent } from '../../pure/TokenSearchContent'

export function TokenSearchResults(): ReactNode {
  const { searchInput } = useTokenListViewState()

  const { selectTokenContext, areTokensFromBridge, allTokens } = useTokenListData()

  const { onSelectToken, onTokenListItemClick } = selectTokenContext

  // Do not make search when tokens are from bridge
  const defaultSearchResults = useSearchToken(areTokensFromBridge ? null : searchInput)

  // For bridge output tokens just filter them instead of making search
  const searchResults: TokenSearchResponse = useMemo(() => {
    if (!areTokensFromBridge) return defaultSearchResults

    const filter = getTokenSearchFilter(searchInput)
    const filteredTokens = allTokens.filter(filter)

    return {
      ...defaultSearchResults,
      activeListsResult: filteredTokens,
    }
  }, [searchInput, areTokensFromBridge, allTokens, defaultSearchResults])

  const { activeListsResult } = searchResults

  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  const addTokenImportCallback = useAddTokenImportCallback()

  const matchedTokens = useMemo(() => {
    return activeListsResult.filter((t) => doesTokenMatchSymbolOrAddress(t, searchInput))
  }, [activeListsResult, searchInput])

  // On press Enter, select first token if only one token is found or it fully matches to the search input
  const onInputPressEnter = useCallback(() => {
    if (!searchInput || !activeListsResult) return

    if (activeListsResult.length === 1 || matchedTokens.length === 1) {
      const tokenToSelect = matchedTokens[0] || activeListsResult[0]

      if (tokenToSelect) {
        onTokenListItemClick?.(tokenToSelect)
        onSelectToken(tokenToSelect)
      }
    }
  }, [searchInput, activeListsResult, matchedTokens, onSelectToken, onTokenListItemClick])

  useEffect(() => {
    updateSelectTokenWidget({
      onInputPressEnter,
    })
  }, [onInputPressEnter, updateSelectTokenWidget])

  return (
    <CommonListContainer id="currency-list">
      <TokenSearchContent
        importToken={addTokenImportCallback}
        searchInput={searchInput}
        selectTokenContext={selectTokenContext}
        searchResults={searchResults}
      />
    </CommonListContainer>
  )
}
