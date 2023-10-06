import { useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Edit, X } from 'react-feather'

import * as styledEl from './styled'

import { IconButton } from '../../pure/commonElements'
import { FavouriteTokensList } from '../../pure/FavouriteTokensList'
import { TokensVirtualList } from '../../pure/TokensVirtualList'
import { TokenSearchResults } from '../TokenSearchResults'

export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favouriteTokens: TokenWithLogo[]
  balances: { [key: string]: CurrencyAmount<Currency> }
  selectedToken?: TokenWithLogo
  onSelectToken(token: TokenWithLogo): void
  defaultInputValue?: string
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

  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

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
      <styledEl.Separator />
      {inputValue ? (
        <TokenSearchResults
          searchInput={inputValue}
          onSelectToken={onSelectToken}
          selectedToken={selectedToken}
          balances={balances}
        />
      ) : (
        <TokensVirtualList
          allTokens={allTokens}
          selectedToken={selectedToken}
          balances={balances}
          onSelectToken={onSelectToken}
        />
      )}
      <styledEl.Separator />
      <div>
        <styledEl.ActionButton onClick={onOpenManageWidget}>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </styledEl.Wrapper>
  )
}
