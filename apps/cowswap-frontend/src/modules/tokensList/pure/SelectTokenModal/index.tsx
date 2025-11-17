import { ReactNode } from 'react'

import { SearchInput } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { TokensContentSection, TitleBarActions, useSelectTokenContext, useTokenSearchInput } from './helpers'
import { SelectTokenModalContent } from './SelectTokenModalContent'
import * as styledEl from './styled'

import { LpTokenListsWidget } from '../../containers/LpTokenListsWidget'
import { ChainPanel } from '../ChainPanel'
import { ChainsSelector } from '../ChainsSelector'

import type { SelectTokenModalProps } from './types'
import type { TokenSelectionHandler } from '../../types'

export type { SelectTokenModalProps }

export function SelectTokenModal(props: SelectTokenModalProps): ReactNode {
  const {
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
  } = useSelectTokenModalLayout(props)

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
        chainsToSelect={legacyChainsState}
        onSelectChain={onSelectChain}
      >
        <TokensContentSection
          displayLpTokenLists={displayLpTokenLists}
          favoriteTokens={favoriteTokens}
          recentTokens={recentTokens}
          onClearRecentTokens={onClearRecentTokens}
          onOpenManageWidget={onOpenManageWidget}
          standalone={standalone}
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
  onSelectToken: TokenSelectionHandler
  openPoolPage(poolAddress: string): void
  disableErc20?: boolean
  tokenListCategoryState: SelectTokenModalProps['tokenListCategoryState']
  isRouteAvailable: boolean | undefined
  chainsToSelect?: SelectTokenModalProps['chainsToSelect']
  onSelectChain: SelectTokenModalProps['onSelectChain']
  children: ReactNode
}

function TokenColumnContent({
  displayLpTokenLists,
  account,
  inputValue,
  onSelectToken,
  openPoolPage,
  disableErc20,
  tokenListCategoryState,
  isRouteAvailable,
  chainsToSelect,
  onSelectChain,
  children,
}: TokenColumnContentProps): ReactNode {
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

  return (
    <>
      {renderLegacyChainSelector(chainsToSelect, onSelectChain)}
      <SelectTokenModalContent isRouteAvailable={isRouteAvailable}>{children}</SelectTokenModalContent>
    </>
  )
}

function renderLegacyChainSelector(
  chainsToSelect: SelectTokenModalProps['chainsToSelect'],
  onSelectChain: SelectTokenModalProps['onSelectChain'],
): ReactNode {
  if (!chainsToSelect?.chains?.length || !onSelectChain) {
    return null
  }

  return (
    <styledEl.LegacyChainsWrapper>
      <ChainsSelector
        isLoading={chainsToSelect.isLoading || false}
        chains={chainsToSelect.chains}
        defaultChainId={chainsToSelect.defaultChainId}
        onSelectChain={onSelectChain}
      />
    </styledEl.LegacyChainsWrapper>
  )
}

interface ChainPanelLayout {
  showChainPanel: boolean
  legacyChainsState: SelectTokenModalProps['chainsToSelect']
  chainPanel: ReactNode
  resolvedTitle: string
}

function getChainPanelLayout({
  hasChainPanel,
  chainsToSelect,
  onSelectChain,
  chainsPanelTitle,
}: Pick<SelectTokenModalProps, 'hasChainPanel' | 'chainsToSelect' | 'onSelectChain' | 'chainsPanelTitle'>): ChainPanelLayout {
  const resolvedTitle = chainsPanelTitle ?? t`Cross chain swap`
  if (!chainsToSelect?.chains?.length || !onSelectChain) {
    return { showChainPanel: false, legacyChainsState: undefined, chainPanel: null, resolvedTitle }
  }

  const showChainPanel = Boolean(hasChainPanel)
  const legacyChainsState = showChainPanel ? undefined : chainsToSelect
  const chainPanel = showChainPanel ? (
    <ChainPanel title={resolvedTitle} chainsState={chainsToSelect} onSelectChain={onSelectChain} />
  ) : null

  return { showChainPanel, legacyChainsState, chainPanel, resolvedTitle }
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
  const { defaultInputValue = '', chainsToSelect, onSelectChain, modalTitle, hasChainPanel = false, chainsPanelTitle } = props

  const [inputValue, setInputValue, trimmedInputValue] = useTokenSearchInput(defaultInputValue)
  const selectTokenContext = useSelectTokenContext(props)
  const resolvedModalTitle = modalTitle ?? t`Select token`
  const { showChainPanel, legacyChainsState, chainPanel } = getChainPanelLayout({
    hasChainPanel,
    chainsToSelect,
    onSelectChain,
    chainsPanelTitle,
  })

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
      <styledEl.Body>
        <styledEl.TokenColumn>{children}</styledEl.TokenColumn>
        {sideContent}
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}
