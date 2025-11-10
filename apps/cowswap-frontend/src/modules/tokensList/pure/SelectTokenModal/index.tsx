import { ComponentProps, ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SearchInput } from '@cowprotocol/ui'

import { TokensContentSection, TitleBarActions, useSelectTokenContext, useTokenSearchInput } from './helpers'
import { MobileChainSelector } from './MobileChainSelector'
import { SelectTokenModalContent } from './SelectTokenModalContent'
import * as styledEl from './styled'

import { LpTokenListsWidget } from '../../containers/LpTokenListsWidget'

import type { SelectTokenModalProps } from './types'
export type { SelectTokenModalProps }

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
    hasChainPanel = false,
    standalone,
    onOpenManageWidget,
    favoriteTokens,
    recentTokens,
    areTokensLoading,
    allTokens,
    areTokensFromBridge,
    hideFavoriteTokensTooltip,
    selectedTargetChainId,
    mobileChainsState,
    mobileChainsLabel,
    onSelectChain,
    onOpenMobileChainPanel,
    isFullScreenMobile,
  } = props

  const [inputValue, setInputValue, trimmedInputValue] = useTokenSearchInput(defaultInputValue)
  const selectTokenContext = useSelectTokenContext(props)
  const resolvedModalTitle = modalTitle ?? 'Select token'
  const mobileChainSelector = getMobileChainSelectorConfig({
    hasChainPanel,
    mobileChainsState,
    mobileChainsLabel,
    onSelectChain,
    onOpenMobileChainPanel,
  })

  return (
    <SelectTokenModalShell
      hasChainPanel={hasChainPanel}
      isFullScreenMobile={isFullScreenMobile}
      title={resolvedModalTitle}
      showManageButton={!standalone}
      onDismiss={onDismiss}
      onOpenManageWidget={onOpenManageWidget}
      searchValue={inputValue}
      onSearchChange={setInputValue}
      onSearchEnter={onInputPressEnter}
      mobileChainSelector={mobileChainSelector}
    >
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
        <TokensContentSection
          displayLpTokenLists={displayLpTokenLists}
          favoriteTokens={favoriteTokens}
          recentTokens={recentTokens}
          areTokensLoading={areTokensLoading}
          allTokens={allTokens}
          searchInput={trimmedInputValue}
          areTokensFromBridge={areTokensFromBridge}
          hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
          selectedTargetChainId={selectedTargetChainId}
          selectTokenContext={selectTokenContext}
        />
      </TokenColumnContent>
    </SelectTokenModalShell>
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

interface SelectTokenModalShellProps {
  children: ReactNode
  hasChainPanel: boolean
  isFullScreenMobile?: boolean
  title: string
  showManageButton: boolean
  onDismiss(): void
  onOpenManageWidget: () => void
  searchValue: string
  onSearchChange(value: string): void
  onSearchEnter?: () => void
  mobileChainSelector?: ComponentProps<typeof MobileChainSelector>
}

function SelectTokenModalShell({
  children,
  hasChainPanel,
  isFullScreenMobile,
  title,
  showManageButton,
  onDismiss,
  onOpenManageWidget,
  searchValue,
  onSearchChange,
  onSearchEnter,
  mobileChainSelector,
}: SelectTokenModalShellProps): ReactNode {
  return (
    <styledEl.Wrapper $hasChainPanel={hasChainPanel} $isFullScreen={isFullScreenMobile}>
      <TitleBarActions
        showManageButton={showManageButton}
        onDismiss={onDismiss}
        onOpenManageWidget={onOpenManageWidget}
        title={title}
      />
      <styledEl.SearchRow>
        <styledEl.SearchInputWrapper>
          <SearchInput
            id="token-search-input"
            value={searchValue}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSearchEnter?.()
              }
            }}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name or paste address..."
          />
        </styledEl.SearchInputWrapper>
      </styledEl.SearchRow>
      {mobileChainSelector ? <MobileChainSelector {...mobileChainSelector} /> : null}
      <styledEl.Body>
        <styledEl.TokenColumn>{children}</styledEl.TokenColumn>
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}

function getMobileChainSelectorConfig({
  hasChainPanel,
  mobileChainsState,
  mobileChainsLabel,
  onSelectChain,
  onOpenMobileChainPanel,
}: {
  hasChainPanel: boolean
  mobileChainsState: SelectTokenModalProps['mobileChainsState']
  mobileChainsLabel: SelectTokenModalProps['mobileChainsLabel']
  onSelectChain: SelectTokenModalProps['onSelectChain']
  onOpenMobileChainPanel: SelectTokenModalProps['onOpenMobileChainPanel']
}): ComponentProps<typeof MobileChainSelector> | undefined {
  const canRender =
    !hasChainPanel &&
    mobileChainsState &&
    onSelectChain &&
    onOpenMobileChainPanel &&
    (mobileChainsState.chains?.length ?? 0) > 0

  if (!canRender) {
    return undefined
  }

  return {
    chainsState: mobileChainsState,
    label: mobileChainsLabel,
    onSelectChain,
    onOpenPanel: onOpenMobileChainPanel,
  }
}
