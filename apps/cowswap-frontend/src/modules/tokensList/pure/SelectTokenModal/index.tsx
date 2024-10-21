import React, { useState } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { UnsupportedTokensState } from '@cowprotocol/tokens'
import { BackButton, SearchInput } from '@cowprotocol/ui'

import { Edit } from 'react-feather'

import { PermitCompatibleTokens } from 'modules/permit'

import * as styledEl from './styled'

import { LpTokenListsWidget } from '../../containers/LpTokenListsWidget'
import { TokenSearchResults } from '../../containers/TokenSearchResults'
import { SelectTokenContext } from '../../types'
import { FavoriteTokensList } from '../FavoriteTokensList'
import { TokensVirtualList } from '../TokensVirtualList'

export interface SelectTokenModalProps {
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  balancesState: BalancesState
  unsupportedTokens: UnsupportedTokensState
  selectedToken?: string
  permitCompatibleTokens: PermitCompatibleTokens
  hideFavoriteTokensTooltip?: boolean
  displayLpTokenLists?: boolean
  account: string | undefined

  onSelectToken(token: TokenWithLogo): void

  onInputPressEnter?(): void

  defaultInputValue?: string

  onOpenManageWidget(): void

  onDismiss(): void
}

export function SelectTokenModal(props: SelectTokenModalProps) {
  const {
    defaultInputValue = '',
    favoriteTokens,
    allTokens,
    selectedToken,
    balancesState,
    unsupportedTokens,
    permitCompatibleTokens,
    hideFavoriteTokensTooltip,
    onSelectToken,
    onDismiss,
    onOpenManageWidget,
    onInputPressEnter,
    account,
    displayLpTokenLists,
  } = props

  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

  const selectTokenContext: SelectTokenContext = {
    balancesState,
    selectedToken,
    onSelectToken,
    unsupportedTokens,
    permitCompatibleTokens,
  }

  const allListsContent = (
    <>
      <styledEl.Row>
        <FavoriteTokensList
          onSelectToken={onSelectToken}
          selectedToken={selectedToken}
          tokens={favoriteTokens}
          hideTooltip={hideFavoriteTokensTooltip}
        />
      </styledEl.Row>
      <styledEl.Separator />
      {inputValue.trim() ? (
        <TokenSearchResults searchInput={inputValue.trim()} {...selectTokenContext} />
      ) : (
        <TokensVirtualList allTokens={allTokens} {...selectTokenContext} account={account} />
      )}
      <styledEl.Separator />
      <div>
        <styledEl.ActionButton id="list-token-manage-button" onClick={onOpenManageWidget}>
          <Edit /> <span>Manage Token Lists</span>
        </styledEl.ActionButton>
      </div>
    </>
  )

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <BackButton onClick={onDismiss} />
        <h3>Select a token</h3>
      </styledEl.Header>
      <styledEl.Row>
        <SearchInput
          id="token-search-input"
          value={inputValue}
          onKeyDown={(e) => e.key === 'Enter' && onInputPressEnter?.()}
          onChange={(e) => setInputValue(e.target.value)}
          type="text"
          placeholder="Search name or paste address"
        />
      </styledEl.Row>
      {displayLpTokenLists ? (
        <LpTokenListsWidget search={inputValue} onSelectToken={onSelectToken}>
          {allListsContent}
        </LpTokenListsWidget>
      ) : (
        allListsContent
      )}
    </styledEl.Wrapper>
  )
}
