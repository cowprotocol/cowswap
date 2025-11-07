import { ReactNode, useMemo, useState } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenListCategory, TokenListTags, UnsupportedTokensState } from '@cowprotocol/tokens'
import { BackButton, SearchInput } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { PermitCompatibleTokens } from 'modules/permit'
import { SettingsIcon } from 'modules/trade/pure/Settings'

import { SelectTokenModalContent } from './SelectTokenModalContent'
import * as styledEl from './styled'

import { LpTokenListsWidget } from '../../containers/LpTokenListsWidget'
import { SelectTokenContext } from '../../types'
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
  tokenListCategoryState: [T, (category: T) => void]
  defaultInputValue?: string
  areTokensLoading: boolean
  tokenListTags: TokenListTags
  standalone?: boolean
  areTokensFromBridge: boolean
  isRouteAvailable: boolean | undefined
  modalTitle?: string
  hasChainPanel?: boolean

  onSelectToken(token: TokenWithLogo): void
  openPoolPage(poolAddress: string): void
  onInputPressEnter?(): void
  onOpenManageWidget(): void
  onDismiss(): void
}

function useSelectTokenContext(props: SelectTokenModalProps): SelectTokenContext {
  const {
    selectedToken,
    balancesState,
    unsupportedTokens,
    permitCompatibleTokens,
    onSelectToken,
    account,
    tokenListTags,
  } = props

  return useMemo(
    () => ({
      balancesState,
      selectedToken,
      onSelectToken,
      unsupportedTokens,
      permitCompatibleTokens,
      tokenListTags,
      isWalletConnected: !!account,
    }),
    [balancesState, selectedToken, onSelectToken, unsupportedTokens, permitCompatibleTokens, tokenListTags, account],
  )
}

function useTokenSearchInput(defaultInputValue = ''): [string, (value: string) => void, string] {
  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

  return [inputValue, setInputValue, inputValue.trim()]
}

function useTokensContent(props: SelectTokenModalProps, searchInput: string, context: SelectTokenContext): ReactNode {
  const {
    displayLpTokenLists,
    favoriteTokens,
    selectedToken,
    hideFavoriteTokensTooltip,
    areTokensLoading,
    allTokens,
    areTokensFromBridge,
    onSelectToken,
  } = props

  return (
    <TokensContent
      displayLpTokenLists={displayLpTokenLists}
      selectTokenContext={context}
      favoriteTokens={favoriteTokens}
      selectedToken={selectedToken}
      hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
      areTokensLoading={areTokensLoading}
      allTokens={allTokens}
      searchInput={searchInput}
      areTokensFromBridge={areTokensFromBridge}
      onSelectToken={onSelectToken}
    />
  )
}

function TitleBarActions({
  showManageButton,
  onDismiss,
  onOpenManageWidget,
  title,
}: {
  showManageButton: boolean
  onDismiss(): void
  onOpenManageWidget(): void
  title: string
}): ReactNode {
  return (
    <styledEl.TitleBar>
      <styledEl.TitleGroup>
        <BackButton onClick={onDismiss} />
        <styledEl.ModalTitle>{title}</styledEl.ModalTitle>
      </styledEl.TitleGroup>
      {showManageButton && (
        <styledEl.TitleActions>
          <styledEl.TitleActionButton
            id="list-token-manage-button"
            onClick={onOpenManageWidget}
            aria-label="Manage token lists"
            title="Manage token lists"
          >
            <SettingsIcon />
          </styledEl.TitleActionButton>
        </styledEl.TitleActions>
      )}
    </styledEl.TitleBar>
  )
}

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
    isRouteAvailable,
    modalTitle,
    hasChainPanel,
    standalone,
    onOpenManageWidget,
  } = props

  const [inputValue, setInputValue, trimmedInputValue] = useTokenSearchInput(defaultInputValue)
  const selectTokenContext = useSelectTokenContext(props)
  const allListsContent = useTokensContent(props, trimmedInputValue, selectTokenContext)
  const resolvedModalTitle = modalTitle ?? 'Select token'

  return (
    <styledEl.Wrapper $hasChainPanel={hasChainPanel}>
      <TitleBarActions
        showManageButton={!standalone}
        onDismiss={onDismiss}
        onOpenManageWidget={onOpenManageWidget}
        title={resolvedModalTitle}
      />
      <styledEl.SearchRow>
        <SearchInput
          id="token-search-input"
          value={inputValue}
          onKeyDown={(e) => e.key === 'Enter' && onInputPressEnter?.()}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search name or paste address..."
        />
      </styledEl.SearchRow>
      <styledEl.Body>
        <styledEl.TokenColumn>
          <TokenColumnContent
            displayLpTokenLists={displayLpTokenLists}
            account={account}
            inputValue={inputValue}
            onSelectToken={onSelectToken}
            openPoolPage={openPoolPage}
            disableErc20={disableErc20}
            tokenListCategoryState={tokenListCategoryState}
            isRouteAvailable={isRouteAvailable}
          >
            {allListsContent}
          </TokenColumnContent>
        </styledEl.TokenColumn>
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}

interface TokenColumnContentProps {
  displayLpTokenLists?: boolean
  account: string | undefined
  inputValue: string
  onSelectToken(token: TokenWithLogo): void
  openPoolPage(poolAddress: string): void
  disableErc20?: boolean
  tokenListCategoryState: SelectTokenModalProps['tokenListCategoryState']
  isRouteAvailable: boolean | undefined
  children: ReactNode
}

function TokenColumnContent(props: TokenColumnContentProps): ReactNode {
  const {
    displayLpTokenLists,
    account,
    inputValue,
    onSelectToken,
    openPoolPage,
    disableErc20,
    tokenListCategoryState,
    isRouteAvailable,
    children,
  } = props

  if (displayLpTokenLists) {
    return (
      <LpTokenListsWidget
        account={account}
        search={inputValue}
        onSelectToken={onSelectToken}
        openPoolPage={openPoolPage}
        disableErc20={disableErc20}
        tokenListCategoryState={tokenListCategoryState}
      >
        {children}
      </LpTokenListsWidget>
    )
  }

  return <SelectTokenModalContent isRouteAvailable={isRouteAvailable}>{children}</SelectTokenModalContent>
}
