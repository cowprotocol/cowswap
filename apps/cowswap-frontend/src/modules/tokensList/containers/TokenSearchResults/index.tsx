import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useNetworkName } from '@cowprotocol/common-hooks'
import { useSearchToken } from '@cowprotocol/tokens'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { CommonListContainer } from '../../pure/commonElements'
import { ImportTokenItem } from '../../pure/ImportTokenItem'
import { TokenListItem } from '../../pure/TokenListItem'
import { TokenSourceTitle } from '../../pure/TokenSourceTitle'

const Wrapper = styled(CommonListContainer)``

const TokenNotFound = styled.div`
  color: var(${UI.COLOR_LINK});
  font-weight: 500;
  padding: 10px 0;
  text-align: center;
`

export interface TokenSearchResultsProps {
  searchInput: string
  balances: { [key: string]: CurrencyAmount<Currency> }
  selectedToken?: TokenWithLogo
  onSelectToken(token: TokenWithLogo): void
}
export function TokenSearchResults({ searchInput, balances, selectedToken, onSelectToken }: TokenSearchResultsProps) {
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

  if (isTokenNotFound) return <TokenNotFound>No tokens found for this name in {networkName}</TokenNotFound>

  return (
    <Wrapper>
      {activeListsResult &&
        activeListsResult.map((token) => (
          <TokenListItem
            key={token.address}
            selectedToken={selectedToken}
            token={token}
            balances={balances}
            onSelectToken={onSelectToken}
          />
        ))}
      {blockchainResult?.length ? (
        <div>
          {blockchainResult.map((token) => {
            return <ImportTokenItem key={token.address} token={token} importToken={addTokenImportCallback} />
          })}
        </div>
      ) : null}
      {inactiveListsResult?.length ? (
        <div>
          <TokenSourceTitle tooltip="Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.">
            Expanded results from inactive Token Lists
          </TokenSourceTitle>
          <div>
            {inactiveListsResult.map((token) => {
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
