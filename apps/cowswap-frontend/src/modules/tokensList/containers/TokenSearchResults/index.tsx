import { useEffect, useMemo } from 'react'

import { useNetworkName } from '@cowprotocol/common-hooks'
import { doesTokenMatchSymbolOrAddress } from '@cowprotocol/common-utils'
import { useSearchToken } from '@cowprotocol/tokens'

import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { CommonListContainer } from '../../pure/commonElements'
import { ImportTokenItem } from '../../pure/ImportTokenItem'
import { TokenListItem } from '../../pure/TokenListItem'
import { TokenSourceTitle } from '../../pure/TokenSourceTitle'
import { SelectTokenContext } from '../../types'

const Wrapper = styled(CommonListContainer)``

const TokenNotFound = styled.div`
  color: var(${UI.COLOR_LINK});
  font-weight: 500;
  padding: 10px 0;
  text-align: center;
`

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

  const searchCount = useMemo(() => {
    return [
      activeListsResult?.length,
      inactiveListsResult?.length,
      blockchainResult?.length,
      externalApiResult?.length,
    ].reduce<number>((acc, cur) => acc + (cur ?? 0), 0)
  }, [activeListsResult?.length, inactiveListsResult?.length, blockchainResult?.length, externalApiResult?.length])

  const isTokenNotFound = useMemo(() => {
    if (isLoading) return false

    return searchCount === 0
  }, [isLoading, searchCount])

  // On press Enter, select first token if only one token is found or it's fully matches to the search input
  useEffect(() => {
    if (!isEnterPressed || !searchInput || !activeListsResult) return

    if (activeListsResult.length === 1 || doesTokenMatchSymbolOrAddress(activeListsResult[0], searchInput)) {
      onSelectToken(activeListsResult[0])
    }
  }, [isEnterPressed, searchInput, activeListsResult, onSelectToken])

  if (isTokenNotFound) return <TokenNotFound>No tokens found for this name in {networkName}</TokenNotFound>

  return (
    <Wrapper>
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
        <div>
          {blockchainResult.slice(0, searchResultsLimit).map((token) => {
            return <ImportTokenItem key={token.address} token={token} importToken={addTokenImportCallback} />
          })}
        </div>
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
    </Wrapper>
  )
}
