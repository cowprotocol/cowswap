import { useCallback, useEffect, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { useSearchToken } from '@cowprotocol/tokens'
import { BannerOrientation, ExternalLink, InlineBanner, LINK_GUIDE_ADD_CUSTOM_TOKEN, Loader } from '@cowprotocol/ui'

import { useNetworkName } from 'common/hooks/useNetworkName'

import * as styledEl from './styled'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'
import { CommonListContainer } from '../../pure/commonElements'
import { ImportTokenItem } from '../../pure/ImportTokenItem'
import { TokenListItem } from '../../pure/TokenListItem'
import { TokenSourceTitle } from '../../pure/TokenSourceTitle'
import { SelectTokenContext } from '../../types'

const SEARCH_RESULTS_LIMIT = 10

export interface TokenSearchResultsProps extends SelectTokenContext {
  searchInput: string
}

export function TokenSearchResults({
  searchInput,
  balancesState,
  selectedToken,
  onSelectToken,
  unsupportedTokens,
  permitCompatibleTokens,
}: TokenSearchResultsProps) {
  const searchResults = useSearchToken(searchInput)
  const { values: balances } = balancesState

  const { inactiveListsResult, blockchainResult, activeListsResult, externalApiResult, isLoading } = searchResults

  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  const addTokenImportCallback = useAddTokenImportCallback()

  const networkName = useNetworkName()

  const searchCount = [
    activeListsResult.length,
    inactiveListsResult.length,
    blockchainResult.length,
    externalApiResult.length,
  ].reduce<number>((acc, cur) => acc + (cur ?? 0), 0)

  const isTokenNotFound = useMemo(() => {
    if (isLoading) return false

    return searchCount === 0
  }, [isLoading, searchCount])

  const [matchedTokens, activeList] = useMemo(() => {
    const matched: TokenWithLogo[] = []
    const remaining: TokenWithLogo[] = []

    for (const t of activeListsResult) {
      if (doesTokenMatchSymbolOrAddress(t, searchInput)) {
        // There should ever be only 1 token with a given address
        // There can be multiple with the same symbol
        matched.push(t)
      } else {
        remaining.push(t)
      }
    }

    return [matched, remaining]
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
      <InlineBanner margin={'10px'} width="auto" orientation={BannerOrientation.Horizontal} bannerType={'information'}>
        <p>
          Can't find your token on the list?{' '}
          <ExternalLink href={LINK_GUIDE_ADD_CUSTOM_TOKEN}>Read our guide</ExternalLink> on how to add custom tokens.
        </p>
      </InlineBanner>

      {(() => {
        if (isLoading)
          return (
            <styledEl.LoaderWrapper>
              <Loader />
            </styledEl.LoaderWrapper>
          )

        if (isTokenNotFound) return <styledEl.TokenNotFound>No tokens found in {networkName}</styledEl.TokenNotFound>

        return (
          <>
            {/*Matched tokens first, followed by tokens from active lists*/}
            {matchedTokens.concat(activeList).map((token) => {
              const addressLowerCase = token.address.toLowerCase()

              return (
                <TokenListItem
                  key={token.address}
                  isUnsupported={!!unsupportedTokens[addressLowerCase]}
                  isPermitCompatible={permitCompatibleTokens[addressLowerCase]}
                  selectedToken={selectedToken}
                  token={token}
                  balance={balances ? balances[token.address.toLowerCase()] : undefined}
                  onSelectToken={onSelectToken}
                />
              )
            })}

            {/*Tokens from blockchain*/}
            {blockchainResult?.length ? (
              <styledEl.ImportTokenWrapper id="currency-import">
                {blockchainResult.slice(0, SEARCH_RESULTS_LIMIT).map((token) => {
                  return <ImportTokenItem key={token.address} token={token} importToken={addTokenImportCallback} />
                })}
              </styledEl.ImportTokenWrapper>
            ) : null}

            {/*Tokens from inactive lists*/}
            {inactiveListsResult?.length ? (
              <div>
                <TokenSourceTitle tooltip="Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.">
                  Expanded results from inactive Token Lists
                </TokenSourceTitle>
                <div>
                  {inactiveListsResult.slice(0, SEARCH_RESULTS_LIMIT).map((token) => {
                    return (
                      <ImportTokenItem
                        key={token.address}
                        token={token}
                        importToken={addTokenImportCallback}
                        shadowed={true}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}

            {/*Tokens from external sources*/}
            {externalApiResult?.length ? (
              <div>
                <TokenSourceTitle tooltip="Tokens from external sources.">
                  Additional Results from External Sources
                </TokenSourceTitle>
                <div>
                  {externalApiResult.map((token) => {
                    return (
                      <ImportTokenItem
                        key={token.address}
                        token={token}
                        importToken={addTokenImportCallback}
                        shadowed={true}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}
          </>
        )
      })()}
    </CommonListContainer>
  )
}
