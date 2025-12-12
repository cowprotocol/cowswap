import { ReactNode, useMemo } from 'react'

import { SearchInput } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { TitleBarActions, useSelectTokenContext, useTokenSearchInput } from './helpers'
import * as styledEl from './styled'
import { TokenColumnContent } from './TokenColumnContent'

import { ChainPanel } from '../ChainPanel'
import { TokensContent } from '../TokensContent'

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
        <TokensContent
          displayLpTokenLists={displayLpTokenLists}
          selectTokenContext={selectTokenContext}
          favoriteTokens={favoriteTokens}
          recentTokens={recentTokens}
          areTokensLoading={areTokensLoading}
          allTokens={allTokens}
          searchInput={trimmedInputValue}
          areTokensFromBridge={areTokensFromBridge}
          hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
          selectedTargetChainId={selectedTargetChainId}
          onClearRecentTokens={onClearRecentTokens}
          onOpenManageWidget={onOpenManageWidget}
          standalone={standalone}
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
  const showChainPanel = hasChainPanel && Boolean(chainsToSelect?.chains?.length)
  const legacyChainsState =
    !showChainPanel && chainsToSelect && (chainsToSelect.chains?.length ?? 0) > 0 ? chainsToSelect : undefined
  const resolvedChainPanelTitle = chainsPanelTitle ?? t`Cross chain swap`
  const chainPanel = useMemo(
    () =>
      showChainPanel && chainsToSelect ? (
        <ChainPanel title={resolvedChainPanelTitle} chainsState={chainsToSelect} onSelectChain={onSelectChain} />
      ) : null,
    [chainsToSelect, onSelectChain, resolvedChainPanelTitle, showChainPanel],
  )

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
