import React, { useState } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { UnsupportedTokensState } from '@cowprotocol/tokens'
import { BackButton } from '@cowprotocol/ui'

import { Edit } from 'react-feather'

import { PermitCompatibleTokens } from 'modules/permit'

import * as styledEl from './styled'

import { TokenSearchResults } from '../../containers/TokenSearchResults'
import { SelectTokenContext } from '../../types'
import { FavouriteTokensList } from '../FavouriteTokensList'
import { TokensVirtualList } from '../TokensVirtualList'

export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favouriteTokens: TokenWithLogo[]
  balancesState: BalancesState
  unsupportedTokens: UnsupportedTokensState
  selectedToken?: string
  permitCompatibleTokens: PermitCompatibleTokens
  onSelectToken(token: TokenWithLogo): void
  onInputPressEnter?(): void
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
    balancesState,
    unsupportedTokens,
    permitCompatibleTokens,
    onSelectToken,
    onDismiss,
    onOpenManageWidget,
    onInputPressEnter,
  } = props

  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

  const selectTokenContext: SelectTokenContext = {
    balancesState,
    selectedToken,
    onSelectToken,
    unsupportedTokens,
    permitCompatibleTokens,
  }

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <BackButton onClick={onDismiss} />
        <h3>Select a token</h3>
      </styledEl.Header>
      <styledEl.Row>
        <styledEl.SearchInput
          id="token-search-input"
          value={inputValue}
          onKeyDown={(e) => e.key === 'Enter' && onInputPressEnter?.()}
          onChange={(e) => setInputValue(e.target.value)}
          type="text"
          placeholder="Search name or paste address"
        />
      </styledEl.Row>
      <styledEl.Row>
        <FavouriteTokensList onSelectToken={onSelectToken} selectedToken={selectedToken} tokens={favouriteTokens} />
      </styledEl.Row>
      <styledEl.Separator />
      {inputValue.trim() ? (
        <TokenSearchResults searchInput={inputValue.trim()} {...selectTokenContext} />
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
