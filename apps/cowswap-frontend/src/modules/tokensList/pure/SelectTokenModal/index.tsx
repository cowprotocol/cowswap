import React, { ReactNode, useMemo, useState } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { TokenListCategory, TokenListTags, UnsupportedTokensState } from '@cowprotocol/tokens'
import { SearchInput } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { X } from 'react-feather'

import { PermitCompatibleTokens } from 'modules/permit'

import { SelectTokenModalContent } from './SelectTokenModalContent'
import * as styledEl from './styled'

import { LpTokenListsWidget } from '../../containers/LpTokenListsWidget'
import { ChainsToSelectState, SelectTokenContext } from '../../types'
import { ChainsSelector } from '../ChainsSelector'
import { IconButton } from '../commonElements'
import { TokensContent } from '../TokensContent'

export interface SelectTokenModalProps<T = TokenListCategory[] | null> {
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  balancesState: BalancesState
  unsupportedTokens: UnsupportedTokensState
  permitCompatibleTokens: PermitCompatibleTokens
  hideFavoriteTokensTooltip?: boolean
  displayLpTokenLists?: boolean
  disableErc20?: boolean
  account: string | undefined
  chainsToSelect: ChainsToSelectState | undefined
  tokenListCategoryState: [T, (category: T) => void]
  defaultInputValue?: string
  areTokensLoading: boolean
  tokenListTags: TokenListTags
  standalone?: boolean
  areTokensFromBridge: boolean
  isRouteAvailable: boolean | undefined

  openPoolPage(poolAddress: string): void
  onInputPressEnter?(): void
  onOpenManageWidget(): void
  onDismiss(): void
  onSelectChain(chain: ChainInfo): void
}

function useSelectTokenContext(props: SelectTokenModalProps): SelectTokenContext {
  const { balancesState, unsupportedTokens, permitCompatibleTokens, account, tokenListTags } = props

  return useMemo(
    () => ({
      balancesState,
      unsupportedTokens,
      permitCompatibleTokens,
      tokenListTags,
      isWalletConnected: !!account,
    }),
    [balancesState, unsupportedTokens, permitCompatibleTokens, tokenListTags, account],
  )
}

export function SelectTokenModal(props: SelectTokenModalProps): ReactNode {
  const {
    defaultInputValue = '',
    onDismiss,
    onInputPressEnter,
    account,
    displayLpTokenLists,
    openPoolPage,
    tokenListCategoryState,
    disableErc20,
    chainsToSelect,
    onSelectChain,
    areTokensFromBridge,
    isRouteAvailable,
  } = props
  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

  const selectTokenContext = useSelectTokenContext(props)

  const trimmedInputValue = inputValue.trim()

  const allListsContent = (
    <TokensContent
      {...props}
      selectTokenContext={selectTokenContext}
      searchInput={trimmedInputValue}
      areTokensFromBridge={areTokensFromBridge}
    />
  )

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <SearchInput
          id="token-search-input"
          value={inputValue}
          onKeyDown={(e) => e.key === 'Enter' && onInputPressEnter?.()}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t`Search name or paste address...`}
        />
        <IconButton onClick={onDismiss}>
          <X size={18} />
        </IconButton>
      </styledEl.Header>
      {displayLpTokenLists ? (
        <LpTokenListsWidget
          account={account}
          search={inputValue}
          openPoolPage={openPoolPage}
          disableErc20={disableErc20}
          tokenListCategoryState={tokenListCategoryState}
        >
          {allListsContent}
        </LpTokenListsWidget>
      ) : (
        <>
          {!!chainsToSelect?.chains?.length && (
            <>
              <styledEl.ChainsSelectorWrapper>
                <ChainsSelector
                  isLoading={chainsToSelect.isLoading || false}
                  chains={chainsToSelect.chains}
                  defaultChainId={chainsToSelect.defaultChainId}
                  onSelectChain={onSelectChain}
                />
              </styledEl.ChainsSelectorWrapper>
            </>
          )}
          <SelectTokenModalContent isRouteAvailable={isRouteAvailable}>{allListsContent}</SelectTokenModalContent>
        </>
      )}
    </styledEl.Wrapper>
  )
}
