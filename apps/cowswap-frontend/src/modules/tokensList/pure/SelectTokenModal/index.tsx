import React, { useState } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenListCategory, UnsupportedTokensState } from '@cowprotocol/tokens'
import { ChainInfo } from '@cowprotocol/types'
import { SearchInput } from '@cowprotocol/ui'

import { Edit, X } from 'react-feather'

import { PermitCompatibleTokens } from 'modules/permit'

import * as styledEl from './styled'

import { LpTokenListsWidget } from '../../containers/LpTokenListsWidget'
import { TokenSearchResults } from '../../containers/TokenSearchResults'
import { SelectTokenContext } from '../../types'
import { ChainsSelector } from '../ChainsSelector'
import { IconButton } from '../commonElements'
import { FavoriteTokensList } from '../FavoriteTokensList'
import { TokensVirtualList } from '../TokensVirtualList'

export interface SelectTokenModalProps<T = TokenListCategory[] | null> {
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  balancesState: BalancesState
  unsupportedTokens: UnsupportedTokensState
  selectedToken?: string
  permitCompatibleTokens: PermitCompatibleTokens
  hideFavoriteTokensTooltip?: boolean
  displayLpTokenLists?: boolean
  disableErc20?: boolean
  account: string | undefined
  chainsToSelect: ChainInfo[] | undefined
  tokenListCategoryState: [T, (category: T) => void]
  defaultInputValue?: string

  onSelectToken(token: TokenWithLogo): void
  openPoolPage(poolAddress: string): void
  onInputPressEnter?(): void
  onOpenManageWidget(): void
  onDismiss(): void
  onSelectChain(chain: ChainInfo): void
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
    openPoolPage,
    tokenListCategoryState,
    disableErc20,
    chainsToSelect,
    onSelectChain,
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
        <TokensVirtualList
          allTokens={allTokens}
          {...selectTokenContext}
          account={account}
          displayLpTokenLists={displayLpTokenLists}
        />
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
        <SearchInput
          id="token-search-input"
          value={inputValue}
          onKeyDown={(e) => e.key === 'Enter' && onInputPressEnter?.()}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search name or paste address..."
        />
        <IconButton onClick={onDismiss}>
          <X size={18} />
        </IconButton>
      </styledEl.Header>
      {displayLpTokenLists ? (
        <LpTokenListsWidget
          account={account}
          search={inputValue}
          onSelectToken={onSelectToken}
          openPoolPage={openPoolPage}
          disableErc20={disableErc20}
          tokenListCategoryState={tokenListCategoryState}
        >
          {allListsContent}
        </LpTokenListsWidget>
      ) : (
        <>
          {chainsToSelect && (
            <>
              <styledEl.ChainsSelectorWrapper>
                <ChainsSelector chains={chainsToSelect} onSelectChain={onSelectChain} />
              </styledEl.ChainsSelectorWrapper>
            </>
          )}
          {allListsContent}
        </>
      )}
    </styledEl.Wrapper>
  )
}
