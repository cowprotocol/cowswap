import { ComponentProps, ReactNode } from 'react'

import { SearchInput } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { TokensContentSection, TitleBarActions, useSelectTokenContext, useTokenSearchInput } from './helpers'
import { MobileChainSelector } from './MobileChainSelector'
import * as styledEl from './styled'
import { TokenColumnContent } from './TokenColumnContent'

import { ChainPanel } from '../ChainPanel'

import type { SelectTokenModalProps } from './types'

export type { SelectTokenModalProps }

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
    onSelectChain,
    areTokensFromBridge,
    isRouteAvailable,
    standalone,
    onOpenManageWidget,
    favoriteTokens,
    recentTokens,
    onClearRecentTokens,
    areTokensLoading,
    allTokens,
    hideFavoriteTokensTooltip,
    selectedTargetChainId,
    hasChainPanel = false,
    chainsPanelTitle,
    mobileChainsState,
    mobileChainsLabel,
    onOpenMobileChainPanel,
    isFullScreenMobile,
  } = props

  const {
    inputValue,
    setInputValue,
    trimmedInputValue,
    selectTokenContext,
    showChainPanel,
    legacyChainsState,
    chainPanel,
    resolvedModalTitle,
  } = useSelectTokenModalLayout({
    ...props,
    defaultInputValue,
    hasChainPanel,
    chainsPanelTitle,
  })

  const mobileChainSelector = getMobileChainSelectorConfig({
    showChainPanel,
    mobileChainsState,
    mobileChainsLabel,
    onSelectChain,
    onOpenMobileChainPanel,
  })
  const chainsForTokenColumn = mobileChainSelector ? undefined : legacyChainsState

  return (
    <SelectTokenModalShell
      hasChainPanel={showChainPanel}
      isFullScreenMobile={isFullScreenMobile}
      title={resolvedModalTitle}
      showManageButton={!standalone}
      onDismiss={onDismiss}
      onOpenManageWidget={onOpenManageWidget}
      searchValue={inputValue}
      onSearchChange={setInputValue}
      onSearchEnter={onInputPressEnter}
      sideContent={chainPanel}
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
        chainsToSelect={chainsForTokenColumn}
        onSelectChain={onSelectChain}
      >
        <TokensContentSection
          displayLpTokenLists={displayLpTokenLists}
        favoriteTokens={favoriteTokens}
        recentTokens={recentTokens}
        onClearRecentTokens={onClearRecentTokens}
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
  sideContent?: ReactNode
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
  sideContent,
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
            placeholder={t`Search name or paste address...`}
          />
        </styledEl.SearchInputWrapper>
      </styledEl.SearchRow>
      {mobileChainSelector ? <MobileChainSelector {...mobileChainSelector} /> : null}
      <styledEl.Body>
        <styledEl.TokenColumn>{children}</styledEl.TokenColumn>
        {sideContent}
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}

function useSelectTokenModalLayout(props: SelectTokenModalProps): {
  inputValue: string
  setInputValue: (value: string) => void
  trimmedInputValue: string
  selectTokenContext: ReturnType<typeof useSelectTokenContext>
  showChainPanel: boolean
  legacyChainsState: SelectTokenModalProps['chainsToSelect']
  chainPanel: ReactNode
  resolvedModalTitle: string
} {
  const {
    defaultInputValue = '',
    chainsToSelect,
    onSelectChain,
    modalTitle,
    hasChainPanel = false,
    chainsPanelTitle,
  } = props

  const [inputValue, setInputValue, trimmedInputValue] = useTokenSearchInput(defaultInputValue)
  const selectTokenContext = useSelectTokenContext(props)
  const resolvedModalTitle = modalTitle ?? t`Select token`
  const showChainPanel = hasChainPanel
  const legacyChainsState =
    !showChainPanel && chainsToSelect && (chainsToSelect.chains?.length ?? 0) > 0 ? chainsToSelect : undefined
  const resolvedChainPanelTitle = chainsPanelTitle ?? t`Cross chain swap`
  const chainPanel =
    showChainPanel && chainsToSelect ? (
      <ChainPanel title={resolvedChainPanelTitle} chainsState={chainsToSelect} onSelectChain={onSelectChain} />
    ) : null

  return {
    inputValue,
    setInputValue,
    trimmedInputValue,
    selectTokenContext,
    showChainPanel,
    legacyChainsState,
    chainPanel,
    resolvedModalTitle,
  }
}

function getMobileChainSelectorConfig({
  showChainPanel,
  mobileChainsState,
  mobileChainsLabel,
  onSelectChain,
  onOpenMobileChainPanel,
}: {
  showChainPanel: boolean
  mobileChainsState: SelectTokenModalProps['mobileChainsState']
  mobileChainsLabel: SelectTokenModalProps['mobileChainsLabel']
  onSelectChain?: SelectTokenModalProps['onSelectChain']
  onOpenMobileChainPanel?: SelectTokenModalProps['onOpenMobileChainPanel']
}): ComponentProps<typeof MobileChainSelector> | undefined {
  const canRender =
    !showChainPanel &&
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
