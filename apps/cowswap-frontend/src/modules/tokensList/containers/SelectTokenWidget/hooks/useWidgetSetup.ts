import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { t } from '@lingui/core/macro'

import { chainPanelStateAtom, DEFAULT_MODAL_UI_STATE, layoutStateAtom, updateSelectTokenModalUIAtom } from '../atoms'

import type { WidgetCallbacks } from '../context/WidgetCallbacksContext'
import type { WidgetConfig } from '../context/WidgetConfigContext'
import type { SelectTokenWidgetViewProps } from '../controllerProps'

interface UseWidgetSetupArgs {
  viewProps: SelectTokenWidgetViewProps
  isChainPanelVisible: boolean
  isCompactLayout: boolean
  isChainPanelEnabled: boolean
}

interface WidgetSetupResult {
  callbacks: WidgetCallbacks
  config: WidgetConfig
}

export function useWidgetSetup({
  viewProps,
  isChainPanelVisible,
  isCompactLayout,
  isChainPanelEnabled,
}: UseWidgetSetupArgs): WidgetSetupResult {
  const { selectTokenModalProps } = viewProps

  const setLayoutState = useSetAtom(layoutStateAtom)
  const setChainPanelState = useSetAtom(chainPanelStateAtom)
  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)

  useEffect(() => {
    setLayoutState({ isCompactLayout, hasChainPanel: isChainPanelVisible })
  }, [setLayoutState, isCompactLayout, isChainPanelVisible])

  useEffect(() => {
    setChainPanelState({
      isEnabled: isChainPanelEnabled,
      isVisible: isChainPanelVisible,
      title: viewProps.chainsPanelTitle ?? t`Cross chain swap`,
    })
  }, [setChainPanelState, isChainPanelEnabled, isChainPanelVisible, viewProps.chainsPanelTitle])

  useEffect(() => {
    if (isChainPanelVisible) {
      updateModalUI({ isMobileChainPanelOpen: false })
    }
  }, [updateModalUI, isChainPanelVisible])

  useEffect(() => {
    updateModalUI({ isManageWidgetOpen: viewProps.isManageWidgetOpen })
  }, [updateModalUI, viewProps.isManageWidgetOpen])

  useEffect(() => {
    return () => updateModalUI(DEFAULT_MODAL_UI_STATE)
  }, [updateModalUI])

  return {
    callbacks: {
      onDismiss: viewProps.onDismiss,
      onOpenManageWidget: selectTokenModalProps.onOpenManageWidget,
      onInputPressEnter: selectTokenModalProps.onInputPressEnter,
      onSelectChain: viewProps.onSelectChain,
      onSelectToken: viewProps.onSelectToken,
      openPoolPage: selectTokenModalProps.openPoolPage,
      onBackFromImport: viewProps.onBackFromImport,
      onImportTokens: viewProps.onImportTokens,
      onImportList: viewProps.onImportList,
      onCloseManageWidget: viewProps.onCloseManageWidget,
      onClosePoolPage: viewProps.onClosePoolPage,
    },
    config: {
      title: selectTokenModalProps.modalTitle ?? t`Select token`,
      showManageButton: !viewProps.standalone,
      chainsPanelTitle: viewProps.chainsPanelTitle ?? t`Cross chain swap`,
      chainsToSelect: viewProps.chainsToSelect,
      displayLpTokenLists: selectTokenModalProps.displayLpTokenLists ?? false,
      tokenListCategoryState: selectTokenModalProps.tokenListCategoryState,
      disableErc20: selectTokenModalProps.disableErc20 ?? false,
      isRouteAvailable: selectTokenModalProps.isRouteAvailable,
      account: selectTokenModalProps.account,
      tokenToImport: viewProps.tokenToImport,
      listToImport: viewProps.listToImport,
      selectedPoolAddress: viewProps.selectedPoolAddress,
      allTokenLists: viewProps.allTokenLists,
      userAddedTokens: viewProps.userAddedTokens,
      standalone: viewProps.standalone ?? false,
    },
  }
}
