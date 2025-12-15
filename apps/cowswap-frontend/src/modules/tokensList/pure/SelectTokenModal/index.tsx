import { ReactNode, useLayoutEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'

import { getMobileChainSelectorConfig, useTokenSearchInput } from './helpers'
import { SelectTokenModalShell } from './SelectTokenModalShell'
import { TokenColumnContent } from './TokenColumnContent'

import { useUpdateTokenListViewState } from '../../hooks/useUpdateTokenListViewState'
import { ChainPanel } from '../ChainPanel'
import { TokensContent } from '../TokensContent'

import type { SelectTokenModalProps } from './types'

export type { SelectTokenModalProps }

/**
 * SelectTokenModal - Token selection modal component.
 *
 * Data flow:
 * - Controller hydrates tokenListViewAtom with token data, context, and callbacks
 * - This modal receives only UI/callback props
 * - Children (TokensContent, TokensVirtualList, etc.) read from atom
 * - searchInput is local state, synced to atom for children to read
 */
export function SelectTokenModal(props: SelectTokenModalProps): ReactNode {
  const {
    // Layout
    standalone,
    hasChainPanel = false,
    isFullScreenMobile,
    modalTitle,
    chainsPanelTitle,
    defaultInputValue = '',
    // Chain panel
    chainsToSelect,
    onSelectChain,
    mobileChainsState,
    mobileChainsLabel,
    onOpenMobileChainPanel,
    // Widget config
    tokenListCategoryState,
    disableErc20,
    isRouteAvailable,
    account,
    displayLpTokenLists,
    // Callbacks
    onSelectToken,
    openPoolPage,
    onInputPressEnter,
    onOpenManageWidget,
    onDismiss,
  } = props

  // Local search state - synced to atom for children to read
  const [inputValue, setInputValue, trimmedInputValue] = useTokenSearchInput(defaultInputValue)

  // Sync ONLY searchInput to atom (controller handles all other hydration)
  const updateTokenListView = useUpdateTokenListViewState()
  useLayoutEffect(() => {
    updateTokenListView({ searchInput: trimmedInputValue })
  }, [trimmedInputValue, updateTokenListView])

  // Resolve layout state
  const showChainPanel = hasChainPanel
  const resolvedModalTitle = modalTitle ?? t`Select token`
  const legacyChainsState =
    !showChainPanel && chainsToSelect && (chainsToSelect.chains?.length ?? 0) > 0 ? chainsToSelect : undefined
  const resolvedChainPanelTitle = chainsPanelTitle ?? t`Cross chain swap`

  // Build chain panel component
  const chainPanel = useMemo(
    () =>
      showChainPanel && chainsToSelect ? (
        <ChainPanel title={resolvedChainPanelTitle} chainsState={chainsToSelect} onSelectChain={onSelectChain} />
      ) : null,
    [chainsToSelect, onSelectChain, resolvedChainPanelTitle, showChainPanel],
  )

  // Build mobile chain selector config
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
