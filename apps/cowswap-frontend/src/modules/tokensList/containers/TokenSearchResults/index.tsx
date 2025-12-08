import { ReactNode, useCallback, useEffect, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { getTokenSearchFilter, TokenSearchResponse, useSearchToken } from '@cowprotocol/tokens'
import {
  BannerOrientation,
  ExternalLink,
  InlineBanner,
  LINK_GUIDE_ADD_CUSTOM_TOKEN,
  StatusColorVariant,
} from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'
import { CommonListContainer } from '../../pure/commonElements'
import { TokenSearchContent } from '../../pure/TokenSearchContent'
import { SelectTokenContext } from '../../types'

export interface TokenSearchResultsProps {
  searchInput: string
  selectTokenContext: SelectTokenContext
  areTokensFromBridge: boolean
  allTokens: TokenWithLogo[]
}

export function TokenSearchResults({
  searchInput,
  selectTokenContext,
  areTokensFromBridge,
  allTokens,
}: TokenSearchResultsProps): ReactNode {
  const { onSelectToken } = selectTokenContext

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
      onSelectToken(matchedTokens[0] || activeListsResult[0])
    }
  }, [searchInput, activeListsResult, matchedTokens, onSelectToken])

  useEffect(() => {
    updateSelectTokenWidget({
      onInputPressEnter,
    })
  }, [onInputPressEnter, updateSelectTokenWidget])

  return (
    <CommonListContainer id="currency-list">
      <InlineBanner
        margin={'10px'}
        width="auto"
        orientation={BannerOrientation.Horizontal}
        bannerType={StatusColorVariant.Info}
      >
        <p>
          <Trans>Can't find your token on the list?</Trans>{' '}
          <Trans><ExternalLink href={LINK_GUIDE_ADD_CUSTOM_TOKEN}>Read our guide</ExternalLink> on how to add custom tokens.</Trans>
        </p>
      </InlineBanner>

      <TokenSearchContent
        importToken={addTokenImportCallback}
        searchInput={searchInput}
        selectTokenContext={selectTokenContext}
        searchResults={searchResults}
      />
    </CommonListContainer>
  )
}
