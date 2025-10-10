import React, { ReactNode, useMemo, useState } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { TokenListCategory, TokenListTags, UnsupportedTokensState } from '@cowprotocol/tokens'
import { SearchInput } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { X } from 'react-feather'
import { Nullish } from 'types'

import { Field } from 'legacy/state/types'

import { PermitCompatibleTokens } from 'modules/permit'
import { TradeType } from 'modules/trade'

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
  selectedToken?: Nullish<Currency>
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
  tradeType?: TradeType
  field?: Field
  isDarkMode?: boolean
  counterChainId?: ChainInfo['id']

  onSelectToken(token: TokenWithLogo): void
  openPoolPage(poolAddress: string): void
  onInputPressEnter?(): void
  onOpenManageWidget(): void
  onDismiss(): void
  onSelectChain(chain: ChainInfo): void
}

// TODO: Break SelectTokenModal into smaller pieces to satisfy max-lines rule.
// eslint-disable-next-line max-lines-per-function
export function SelectTokenModal(props: SelectTokenModalProps): ReactNode {
  const {
    defaultInputValue = '',
    onSelectToken,
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
    tradeType,
    field,
    isDarkMode = false,
    counterChainId,
  } = props
  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

  const selectTokenContext: SelectTokenContext = useMemo(
    () => ({
      balancesState: props.balancesState,
      selectedToken: props.selectedToken,
      onSelectToken: props.onSelectToken,
      unsupportedTokens: props.unsupportedTokens,
      permitCompatibleTokens: props.permitCompatibleTokens,
      tokenListTags: props.tokenListTags,
      isWalletConnected: !!props.account,
    }),
    [
      props.account,
      props.balancesState,
      props.onSelectToken,
      props.permitCompatibleTokens,
      props.selectedToken,
      props.tokenListTags,
      props.unsupportedTokens,
    ],
  )

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
          {!!chainsToSelect?.chains?.length && (
            <>
              <styledEl.ChainsSelectorWrapper>
                <ChainsSelector
                  isLoading={chainsToSelect.isLoading || false}
                  chains={chainsToSelect.chains}
                  defaultChainId={chainsToSelect.defaultChainId}
                  onSelectChain={onSelectChain}
                  tradeType={tradeType}
                  field={field}
                  isDarkMode={isDarkMode}
                  counterChainId={counterChainId}
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
