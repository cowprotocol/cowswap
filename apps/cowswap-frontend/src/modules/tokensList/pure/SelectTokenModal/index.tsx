import { useHydrateAtoms } from 'jotai/utils'
import { ReactNode, useEffect, useLayoutEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'

import { getMobileChainSelectorConfig, useSelectTokenContext, useTokenSearchInput } from './helpers'
import { SelectTokenModalShell } from './SelectTokenModalShell'
import { TokenColumnContent } from './TokenColumnContent'

import { useResetTokenListViewState } from '../../hooks/useResetTokenListViewState'
import { useUpdateTokenListViewState } from '../../hooks/useUpdateTokenListViewState'
import { tokenListViewAtom, TokenListViewState } from '../../state/tokenListViewAtom'
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

  // Compute the view state to hydrate the atom
  const initialViewState: TokenListViewState = useMemo(
    () => ({
      allTokens,
      favoriteTokens,
      recentTokens,
      searchInput: trimmedInputValue,
      areTokensLoading,
      areTokensFromBridge,
      hideFavoriteTokensTooltip: hideFavoriteTokensTooltip ?? false,
      displayLpTokenLists: displayLpTokenLists ?? false,
      selectedTargetChainId,
      selectTokenContext,
      onClearRecentTokens,
    }),
    [
      allTokens,
      favoriteTokens,
      recentTokens,
      trimmedInputValue,
      areTokensLoading,
      areTokensFromBridge,
      hideFavoriteTokensTooltip,
      displayLpTokenLists,
      selectedTargetChainId,
      selectTokenContext,
      onClearRecentTokens,
    ],
  )

  // Hydrate atom SYNCHRONOUSLY on first render (no useEffect!)
  useHydrateAtoms([[tokenListViewAtom, initialViewState]])

  // Keep atom in sync when props change (after initial render)
  // Using useLayoutEffect to ensure atom is updated before paint, avoiding flicker
  // Note: Always pass the full state object; partial updates may leave stale fields
  const updateTokenListView = useUpdateTokenListViewState()
  useLayoutEffect(() => {
    updateTokenListView(initialViewState)
  }, [initialViewState, updateTokenListView])

  // Reset atom on unmount to avoid stale state on reopen (full replace, not partial merge)
  const resetTokenListView = useResetTokenListViewState()
  useEffect(() => {
    return () => resetTokenListView()
  }, [resetTokenListView])

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
        <TokensContent />
      </TokenColumnContent>
    </SelectTokenModalShell>
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
