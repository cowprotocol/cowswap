import { ReactNode, useCallback, useEffect, useMemo } from 'react'

import { doesTokenMatchSymbolOrAddress, getTokenAddressKey } from '@cowprotocol/common-utils'
import { getTokenSearchFilter, TokenSearchResponse, useSearchToken } from '@cowprotocol/tokens'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { useTokenListContext } from '../../hooks/useTokenListContext'
import { useTokenListViewState } from '../../hooks/useTokenListViewState'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'
import { CommonListContainer } from '../../pure/commonElements'
import { TokenSearchContent } from '../../pure/TokenSearchContent'

export function TokenSearchResults(): ReactNode {
  const { searchInput } = useTokenListViewState()

  const { selectTokenContext, areTokensFromBridge, allTokens, bridgeSupportedTokensMap } = useTokenListContext()

  const { onTokenListItemClick } = selectTokenContext

  const { onSelectToken } = useSelectTokenWidgetState()

  // Search all tokens (used in both modes)
  const defaultSearchResults = useSearchToken(searchInput)

  // For bridge mode, merge bridge-supported tokens with search results (non-bridgeable shown as disabled)
  const searchResults: TokenSearchResponse = useMemo(() => {
    if (!areTokensFromBridge) return defaultSearchResults

    // Filter bridge-supported tokens (target chain) by search input
    const filter = getTokenSearchFilter(searchInput)
    const filteredBridgeTokens = allTokens.filter(filter)

    // Merge: bridge tokens first, then additional search results (will be marked disabled)
    const bridgeAddresses = new Set(filteredBridgeTokens.map((t) => getTokenAddressKey(t.address)))
    const additionalTokens = defaultSearchResults.activeListsResult.filter(
      (t) => !bridgeAddresses.has(getTokenAddressKey(t.address)),
    )

    return {
      ...defaultSearchResults,
      activeListsResult: [...filteredBridgeTokens, ...additionalTokens],
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

      // In bridge mode, don't select non-bridgeable tokens (also block while map is loading)
      if (tokenToSelect) {
        const hasAddress = !!tokenToSelect.address
        const isInBridgeMap =
          hasAddress &&
          bridgeSupportedTokensMap !== null &&
          !!bridgeSupportedTokensMap[getTokenAddressKey(tokenToSelect.address)]
        const isBridgeable = !areTokensFromBridge || isInBridgeMap

        if (isBridgeable) {
          onTokenListItemClick?.(tokenToSelect)
          onSelectToken?.(tokenToSelect)
        }
      }
    }
  }, [
    searchInput,
    activeListsResult,
    matchedTokens,
    onSelectToken,
    onTokenListItemClick,
    areTokensFromBridge,
    bridgeSupportedTokensMap,
  ])

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
        areTokensFromBridge={areTokensFromBridge}
        bridgeSupportedTokensMap={bridgeSupportedTokensMap}
      />
    </CommonListContainer>
  )
}
