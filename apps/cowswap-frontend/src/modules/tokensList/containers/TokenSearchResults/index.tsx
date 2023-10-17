import { useEffect, useMemo } from 'react'

import { useNetworkName } from '@cowprotocol/common-hooks'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { useSearchToken } from '@cowprotocol/tokens'

import * as styledEl from './styled'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { CommonListContainer } from '../../pure/commonElements'
import { ImportTokenItem } from '../../pure/ImportTokenItem'
import { TokenListItem } from '../../pure/TokenListItem'
import { TokenSourceTitle } from '../../pure/TokenSourceTitle'
import { SelectTokenContext } from '../../types'

const searchResultsLimit = 10

export interface TokenSearchResultsProps extends SelectTokenContext {
  isEnterPressed: boolean
  searchInput: string
}

export function TokenSearchResults({
  searchInput,
  balances,
  selectedToken,
  onSelectToken,
  unsupportedTokens,
  permitCompatibleTokens,
  isEnterPressed,
}: TokenSearchResultsProps) {
  const { inactiveListsResult, blockchainResult, activeListsResult, externalApiResult, isLoading } =
    useSearchToken(searchInput)

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

  // On press Enter, select first token if only one token is found or it's fully matches to the search input
  useEffect(() => {
    if (!isEnterPressed || !searchInput || !activeListsResult) return

    const matchedToken = activeListsResult.find((token) => doesTokenMatchSymbolOrAddress(token, searchInput))

    if (activeListsResult.length === 1 || matchedToken) {
      onSelectToken(matchedToken || activeListsResult[0])
    }
  }, [isEnterPressed, searchInput, activeListsResult, onSelectToken])

  if (isTokenNotFound) return <styledEl.TokenNotFound>No tokens found for in {networkName}</styledEl.TokenNotFound>

  return (
    <CommonListContainer id="currency-list">
      {/*Tokens from active lists*/}
      {activeListsResult &&
        activeListsResult.slice(0, searchResultsLimit).map((token) => {
          const addressLowerCase = token.address.toLowerCase()

          return (
            <TokenListItem
              key={token.address}
              isUnsupported={!!unsupportedTokens[addressLowerCase]}
              isPermitCompatible={permitCompatibleTokens[addressLowerCase]}
              selectedToken={selectedToken}
              token={token}
              balance={balances ? balances[token.address]?.value : undefined}
              onSelectToken={onSelectToken}
            />
          )
        })}

      {/*Tokens from blockchain*/}
      {blockchainResult?.length ? (
        <styledEl.ImportTokenWrapper id="currency-import">
          {blockchainResult.slice(0, searchResultsLimit).map((token) => {
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
            {inactiveListsResult.slice(0, searchResultsLimit).map((token) => {
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
    </CommonListContainer>
  )
}
