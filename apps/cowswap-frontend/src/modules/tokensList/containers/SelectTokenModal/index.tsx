import { useEffect, useState } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Edit, X } from 'react-feather'

import { searchToken, TokenSearchSource } from './searchToken'
import * as styledEl from './styled'

import { AllTokensList } from '../../pure/AllTokensList'
import { IconButton } from '../../pure/commonElements'
import { FavouriteTokensList } from '../../pure/FavouriteTokensList'
import { ImportTokenItem } from '../../pure/ImportTokenItem'
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

  const [inputValue, setInputValue] = useState<string>(defaultInputValue)
  const debouncedInputValue = useDebounce(inputValue, 500)

  const [tokensFromBlockChain, setTokensFromBlockChain] = useState<TokenWithLogo[]>([])

  const importToken = (token: TokenWithLogo) => {
    console.log('TODO: import token', token)
  }

  useEffect(() => {
    searchToken(debouncedInputValue).then((result) => {
      if (!result) {
        return
      }

      const { source, tokens } = result

      if (source === TokenSearchSource.Blockchain) {
        setTokensFromBlockChain(tokens)
        return
      }
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
      {tokensFromBlockChain.length > 0 && (
        <div>
          {tokensFromBlockChain.map((token) => {
            return <ImportTokenItem token={token} importToken={importToken} />
          })}
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
