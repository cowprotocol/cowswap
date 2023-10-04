import { useEffect, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useNetworkName } from '@cowprotocol/common-hooks'
import { TokenSearchSource, useSearchToken } from '@cowprotocol/tokens'
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

  const [tokensFromBlockChain, setTokensFromBlockChain] = useState<TokenWithLogo[]>([])
  const [tokensFromInactiveLists, setTokensFromInactiveLists] = useState<TokenWithLogo[]>([])
  const [tokensFromExternal, setTokensFromExternal] = useState<TokenWithLogo[]>([])

  const addTokenImportCallback = useAddTokenImportCallback()

  const searchResponse = useSearchToken(inputValue)

  const isTokenNotFound = useMemo(() => {
    if (!searchResponse) return false

    const { loading, result, error } = searchResponse

    if (loading) return false

    if (!result && !error) return false

    return tokensFromExternal.length === 0 && tokensFromBlockChain.length === 0 && tokensFromInactiveLists.length === 0
  }, [searchResponse, tokensFromBlockChain, tokensFromInactiveLists, tokensFromExternal])

  useEffect(() => {
    if (searchResponse?.loading || searchResponse?.error || !searchResponse?.result) {
      setTokensFromBlockChain([])
      setTokensFromInactiveLists([])
      setTokensFromExternal([])
      return
    }

    const { source, tokens } = searchResponse.result

    if (source === TokenSearchSource.Blockchain) {
      setTokensFromBlockChain(tokens)
      return
    }
    if (source === TokenSearchSource.InactiveList) {
      setTokensFromInactiveLists(tokens)
      return
    }
    if (source === TokenSearchSource.External) {
      setTokensFromExternal(tokens)
      return
    }
  }, [searchResponse])

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
      {tokensFromBlockChain.length > 0 && (
        <div>
          {tokensFromBlockChain.map((token) => {
            return <ImportTokenItem token={token} importToken={addTokenImportCallback} />
          })}
        </div>
      )}
      {tokensFromInactiveLists.length > 0 && (
        <div>
          <TokenSourceTitle tooltip="Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.">
            Expanded results from inactive Token Lists
          </TokenSourceTitle>
          <div>
            {tokensFromInactiveLists.map((token) => {
              return <ImportTokenItem token={token} importToken={addTokenImportCallback} shadowed={true} />
            })}
          </div>
        </div>
      )}
      {tokensFromExternal.length > 0 && (
        <div>
          <TokenSourceTitle tooltip="Tokens from external sources.">
            Additional Results from External Sources
          </TokenSourceTitle>
          <div>
            {tokensFromExternal.map((token) => {
              return <ImportTokenItem token={token} importToken={addTokenImportCallback} shadowed={true} />
            })}
          </div>
        </div>
      )}
      {!inputValue && (
        <AllTokensList
          selectedToken={selectedToken}
          tokens={allTokens}
          balances={balances}
          onSelectToken={onSelectToken}
        />
      )}
      <div>
        <styledEl.ActionButton onClick={onOpenManageWidget}>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </styledEl.Wrapper>
  )
}
