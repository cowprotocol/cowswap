import { useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useUnsupportedTokens } from '@cowprotocol/tokens'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Edit, X } from 'react-feather'

import * as styledEl from './styled'

import { useBalancesForTokensList } from '../../hooks/useBalancesForTokensList'
import { IconButton } from '../../pure/commonElements'
import { FavouriteTokensList } from '../../pure/FavouriteTokensList'
import { TokensVirtualList } from '../../pure/TokensVirtualList'
import { SelectTokenContext } from '../../types'
import { TokenSearchResults } from '../TokenSearchResults'

export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favouriteTokens: TokenWithLogo[]
  balances: { [key: string]: CurrencyAmount<Currency> }
  selectedToken?: string
  onSelectToken(token: TokenWithLogo): void
  defaultInputValue?: string
  onOpenManageWidget(): void
  onDismiss(): void
}

const permitCompatibleTokens: { [tokenAddress: string]: boolean } = {} // TODO: Make dynamic

export function SelectTokenModal(props: SelectTokenModalProps) {
  const {
    defaultInputValue = '',
    favouriteTokens,
    allTokens,
    selectedToken,
    onSelectToken,
    onDismiss,
    onOpenManageWidget,
  } = props

  const [inputValue, setInputValue] = useState<string>(defaultInputValue)
  const [isEnterPressed, setIsEnterPressed] = useState<boolean>(false)

  const unsupportedTokens = useUnsupportedTokens()

  const balances = useBalancesForTokensList(allTokens)

  const handleEnterPress = () => {
    setIsEnterPressed(true)
    setTimeout(() => setIsEnterPressed(false), 100)
  }

  const selectTokenContext: SelectTokenContext = {
    balances,
    selectedToken,
    onSelectToken,
    unsupportedTokens,
    permitCompatibleTokens,
  }

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
          id="token-search-input"
          value={inputValue}
          onKeyDown={(e) => e.key === 'Enter' && handleEnterPress()}
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
        <TokenSearchResults searchInput={inputValue} isEnterPressed={isEnterPressed} {...selectTokenContext} />
      ) : (
        <TokensVirtualList allTokens={allTokens} {...selectTokenContext} />
      )}
      <styledEl.Separator />
      <div>
        <styledEl.ActionButton id="list-token-manage-button" onClick={onOpenManageWidget}>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </styledEl.Wrapper>
  )
}
