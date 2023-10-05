import { useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useNetworkName } from '@cowprotocol/common-hooks'
import { useSearchToken } from '@cowprotocol/tokens'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Edit, X } from 'react-feather'

import * as styledEl from './styled'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { AllTokensList } from '../../pure/AllTokensList'
import { IconButton } from '../../pure/commonElements'
import { FavouriteTokensList } from '../../pure/FavouriteTokensList'
import { ImportTokenItem } from '../../pure/ImportTokenItem'
import { TokenSourceTitle } from '../../pure/TokenSourceTitle'

export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favouriteTokens: TokenWithLogo[]
  balances: { [key: string]: CurrencyAmount<Currency> }
  selectedToken?: TokenWithLogo
  defaultInputValue?: string
  onSelectToken(token: TokenWithLogo): void
  onOpenManageWidget(): void
  onDismiss(): void
}

export function SelectTokenModal(props: SelectTokenModalProps) {
  const {
    defaultInputValue = '',
    favouriteTokens,
    allTokens,
    selectedToken,
    balances,
    onSelectToken,
    onDismiss,
    onOpenManageWidget,
  } = props

  const networkName = useNetworkName()

  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

  const addTokenImportCallback = useAddTokenImportCallback()

  const { inactiveListsResult, blockchainResult, activeListsResult, externalApiResult, isLoading } =
    useSearchToken(inputValue)

  const isTokenNotFound = useMemo(() => {
    if (!inputValue || isLoading) return false

    return (
      !activeListsResult?.length &&
      !inactiveListsResult?.length &&
      !blockchainResult?.length &&
      !externalApiResult?.length
    )
  }, [inputValue, isLoading, activeListsResult, inactiveListsResult, blockchainResult, externalApiResult])

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <h3>Select a token</h3>
        <IconButton onClick={onDismiss}>
          <X />
        </IconButton>
      </styledEl.Header>
      <styledEl.Row>
        <styledEl.SearchInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          type="text"
          placeholder="Search name or past address"
        />
      </styledEl.Row>
      <styledEl.Row>
        <FavouriteTokensList onSelectToken={onSelectToken} selectedToken={selectedToken} tokens={favouriteTokens} />
      </styledEl.Row>
      {isTokenNotFound && (
        <styledEl.TokenNotFound>No tokens found for this name in {networkName}</styledEl.TokenNotFound>
      )}
      <styledEl.TokensWrapper>
        {inputValue && activeListsResult && (
          <AllTokensList
            selectedToken={selectedToken}
            tokens={activeListsResult}
            balances={balances}
            onSelectToken={onSelectToken}
          />
        )}
        {blockchainResult?.length ? (
          <div>
            {blockchainResult.map((token) => {
              return <ImportTokenItem token={token} importToken={addTokenImportCallback} />
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
                return <ImportTokenItem token={token} importToken={addTokenImportCallback} shadowed={true} />
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
                return <ImportTokenItem token={token} importToken={addTokenImportCallback} shadowed={true} />
              })}
            </div>
          </div>
        ) : null}
        {!inputValue && (
          <AllTokensList
            selectedToken={selectedToken}
            tokens={allTokens}
            balances={balances}
            onSelectToken={onSelectToken}
          />
        )}
      </styledEl.TokensWrapper>
      <div>
        <styledEl.ActionButton onClick={onOpenManageWidget}>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </styledEl.Wrapper>
  )
}
