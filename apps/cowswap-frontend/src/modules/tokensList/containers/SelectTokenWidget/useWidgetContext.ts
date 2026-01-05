import { useState, useCallback } from 'react'

import { t } from '@lingui/core/macro'

import { SelectTokenWidgetContextValue } from './SelectTokenWidgetContext'

import { useUpdateTokenListViewState } from '../../hooks/useUpdateTokenListViewState'

import type { SelectTokenWidgetViewProps } from './controllerProps'

interface UseWidgetContextArgs {
  viewProps: SelectTokenWidgetViewProps
  isChainPanelVisible: boolean
  isCompactLayout: boolean
  isMobileChainPanelOpen: boolean
  setIsMobileChainPanelOpen: (value: boolean) => void
}

/**
 * Builds context value from controller props.
 * Maps the flat props structure to organized context sections.
 */
export function useWidgetContext({
  viewProps,
  isChainPanelVisible,
  isCompactLayout,
  isMobileChainPanelOpen,
  setIsMobileChainPanelOpen,
}: UseWidgetContextArgs): SelectTokenWidgetContextValue {
  const { selectTokenModalProps } = viewProps

  // Search state (only stateful part)
  const [searchValue, setSearchValueState] = useState('')
  const updateTokenListView = useUpdateTokenListViewState()

  const setSearchValue = useCallback(
    (value: string) => {
      setSearchValueState(value)
      updateTokenListView({ searchInput: value.trim() })
    },
    [updateTokenListView],
  )

  // Simple object construction - no over-memoization needed
  // React will only re-render if the actual values change
  return {
    header: {
      title: selectTokenModalProps.modalTitle ?? t`Select token`,
      showManageButton: !viewProps.standalone,
      onDismiss: viewProps.onDismiss,
      onOpenManageWidget: selectTokenModalProps.onOpenManageWidget,
    },

    search: {
      value: searchValue,
      onChange: setSearchValue,
      onPressEnter: selectTokenModalProps.onInputPressEnter,
    },

    chain: {
      isEnabled: viewProps.isChainPanelEnabled,
      title: viewProps.chainsPanelTitle ?? t`Cross chain swap`,
      chainsToSelect: viewProps.chainsToSelect,
      mobileChainsState: viewProps.isChainPanelEnabled && !isChainPanelVisible ? viewProps.chainsToSelect : undefined,
      isMobileChainPanelOpen,
      isChainPanelVisible,
      onSelectChain: viewProps.onSelectChain,
      onOpenMobileChainPanel: () => setIsMobileChainPanelOpen(true),
      onCloseMobileChainPanel: () => setIsMobileChainPanelOpen(false),
    },

    tokenList: {
      displayLpTokenLists: selectTokenModalProps.displayLpTokenLists ?? false,
      tokenListCategoryState: selectTokenModalProps.tokenListCategoryState,
      disableErc20: selectTokenModalProps.disableErc20 ?? false,
      isRouteAvailable: selectTokenModalProps.isRouteAvailable,
      account: selectTokenModalProps.account,
      onSelectToken: viewProps.onSelectToken,
      openPoolPage: selectTokenModalProps.openPoolPage,
    },

    blockingView: {
      standalone: viewProps.standalone ?? false,
      tokenToImport: viewProps.tokenToImport,
      listToImport: viewProps.listToImport,
      isManageWidgetOpen: viewProps.isManageWidgetOpen,
      selectedPoolAddress: viewProps.selectedPoolAddress,
      allTokenLists: viewProps.allTokenLists,
      userAddedTokens: viewProps.userAddedTokens,
      onBackFromImport: viewProps.onBackFromImport,
      onImportTokens: viewProps.onImportTokens,
      onImportList: viewProps.onImportList,
      onCloseManageWidget: viewProps.onCloseManageWidget,
      onClosePoolPage: viewProps.onClosePoolPage,
    },

    layout: {
      isCompactLayout,
      hasChainPanel: isChainPanelVisible,
    },
  }
}
