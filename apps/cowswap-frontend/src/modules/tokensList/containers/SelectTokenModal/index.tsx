import { useEffect, useMemo, useState } from 'react'

import { useDebounce, useNetworkName } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Edit, X } from 'react-feather'

import { searchToken, TokenSearchSource } from './searchToken'
import * as styledEl from './styled'

import { AllTokensList } from '../../pure/AllTokensList'
import { IconButton } from '../../pure/commonElements'
import { FavouriteTokensList } from '../../pure/FavouriteTokensList'
import { ImportTokenItem } from '../../pure/ImportTokenItem'
import { TokenSourceTitle } from '../../pure/TokenSourceTitle'
import { TokenWithLogo } from '../../types'
export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favouriteTokens: TokenWithLogo[]
  balances: { [key: string]: CurrencyAmount<Currency> }
  selectedToken?: TokenWithLogo
  defaultInputValue?: string
}

export function SelectTokenModal(props: SelectTokenModalProps) {
  const { defaultInputValue = '', favouriteTokens, allTokens, selectedToken, balances } = props

  const networkName = useNetworkName()

  const [isSearchInProgress, setIsSearchInProgress] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>(defaultInputValue)
  const debouncedInputValue = useDebounce(inputValue, 500)

  const [tokensFromBlockChain, setTokensFromBlockChain] = useState<TokenWithLogo[]>([])
  const [tokensFromInactiveLists, setTokensFromInactiveLists] = useState<TokenWithLogo[]>([])
  const [tokensFromExternal, setTokensFromExternal] = useState<TokenWithLogo[]>([])

  const importToken = (token: TokenWithLogo) => {
    console.log('TODO: import token', token)
  }

  const isTokenNotFound = useMemo(() => {
    if (isSearchInProgress || !debouncedInputValue) return false

    return tokensFromExternal.length === 0 && tokensFromBlockChain.length === 0 && tokensFromInactiveLists.length === 0
  }, [debouncedInputValue, isSearchInProgress, tokensFromBlockChain, tokensFromInactiveLists, tokensFromExternal])

  useEffect(() => {
    if (!debouncedInputValue) return

    setIsSearchInProgress(true)
    setTokensFromBlockChain([])
    setTokensFromInactiveLists([])
    setTokensFromExternal([])

    searchToken(debouncedInputValue)
      .then((result) => {
        if (!result) {
          return
        }

        const { source, tokens } = result

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
      })
      .finally(() => {
        setIsSearchInProgress(false)
      })
  }, [debouncedInputValue])

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <h3>Select a token</h3>
        <IconButton>
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
        <FavouriteTokensList selectedToken={selectedToken} tokens={favouriteTokens} />
      </styledEl.Row>
      {isTokenNotFound && (
        <styledEl.TokenNotFound>No tokens found for this name in {networkName}</styledEl.TokenNotFound>
      )}
      {tokensFromBlockChain.length > 0 && (
        <div>
          {tokensFromBlockChain.map((token) => {
            return <ImportTokenItem token={token} importToken={importToken} />
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
              return <ImportTokenItem token={token} importToken={importToken} shadowed={true} />
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
              return <ImportTokenItem token={token} importToken={importToken} shadowed={true} />
            })}
          </div>
        </div>
      )}
      {!debouncedInputValue && (
        <div>
          <AllTokensList selectedToken={selectedToken} tokens={allTokens} balances={balances} />
        </div>
      )}
      <div>
        <styledEl.ActionButton>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </styledEl.Wrapper>
  )
}
