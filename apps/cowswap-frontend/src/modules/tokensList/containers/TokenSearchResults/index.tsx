import { ReactNode, useCallback, useEffect, useMemo } from 'react'

import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { getTokenSearchFilter, TokenSearchResponse, useSearchToken } from '@cowprotocol/tokens'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { Field } from 'legacy/state/types'

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
  const { tokenLists, sellTokenLists, buyTokenLists } = useInjectedWidgetParams()

  const { onTokenListItemClick } = selectTokenContext

  const { field, onSelectToken } = useSelectTokenWidgetState()

  // Search all tokens (used in both modes)
  const defaultSearchResults = useSearchToken(searchInput)
  const filter = useMemo(() => getTokenSearchFilter(searchInput), [searchInput])
  const hasScopedListRestriction = useMemo(() => {
    if (field === Field.INPUT) {
      return !!(tokenLists?.length || sellTokenLists?.length)
    }

    if (field === Field.OUTPUT) {
      return !!(tokenLists?.length || buyTokenLists?.length)
    }

    return !!(tokenLists?.length || sellTokenLists?.length || buyTokenLists?.length)
  }, [buyTokenLists?.length, field, sellTokenLists?.length, tokenLists?.length])

  const searchResults: TokenSearchResponse = useMemo(() => {
    if (!hasScopedListRestriction && !areTokensFromBridge) {
      return defaultSearchResults
    }

    // scoped list restriction
    if (!areTokensFromBridge) {
      return {
        ...defaultSearchResults,
        activeListsResult: allTokens.filter(filter),
        inactiveListsResult: [],
        blockchainResult: [],
        externalApiResult: [],
      }
    }

    const filteredBridgeTokens = allTokens.filter(filter)

    if (hasScopedListRestriction) {
      return {
        ...defaultSearchResults,
        activeListsResult: filteredBridgeTokens,
        inactiveListsResult: [],
        blockchainResult: [],
        externalApiResult: [],
      }
    }

    // Merge: bridge tokens first, then additional search results (will be marked disabled)
    const bridgeAddresses = new Set(filteredBridgeTokens.map((t) => getAddressKey(t.address)))
    const additionalTokens = defaultSearchResults.activeListsResult.filter(
      (t) => !bridgeAddresses.has(getAddressKey(t.address)),
    )

    return {
      ...defaultSearchResults,
      activeListsResult: [...filteredBridgeTokens, ...additionalTokens],
    }
  }, [allTokens, areTokensFromBridge, defaultSearchResults, filter, hasScopedListRestriction])

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
          !!bridgeSupportedTokensMap[getAddressKey(tokenToSelect.address)]
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
