import { buildSelectTokenModalPropsInput, SelectTokenWidgetViewProps } from './controllerProps'
import { useTokenDataSources, useWidgetMetadata } from './tokenDataHooks'
import { useTokenSelectionHandler } from './tokenSelectionHooks'
import { useManageWidgetVisibility, usePoolPageHandlers } from './widgetUIState'

import { useChainsToSelect } from '../../hooks/useChainsToSelect'
import { useOnSelectChain } from '../../hooks/useOnSelectChain'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'

import type { WidgetViewDependenciesResult } from './controllerDependencies'
import type { SelectTokenModalProps } from '../../pure/SelectTokenModal'

interface WidgetModalPropsArgs {
  account: string | undefined
  chainsToSelect: ReturnType<typeof useChainsToSelect>
  displayLpTokenLists?: boolean
  widgetDeps: WidgetViewDependenciesResult
  hasChainPanel: boolean
  onSelectChain: ReturnType<typeof useOnSelectChain>
  standalone?: boolean
  widgetMetadata: ReturnType<typeof useWidgetMetadata>
  widgetState: ReturnType<typeof useSelectTokenWidgetState>
  isRouteAvailable: boolean | undefined
}

/**
 * Builds modal props.
 * Token data and context are hydrated to atom by controller - no longer passed as props.
 */
export function useWidgetModalProps({
  account,
  chainsToSelect,
  displayLpTokenLists,
  widgetDeps,
  hasChainPanel,
  onSelectChain,
  standalone,
  widgetMetadata,
  widgetState,
  isRouteAvailable,
}: WidgetModalPropsArgs): SelectTokenModalProps {
  return buildSelectTokenModalPropsInput({
    // Layout
    standalone,
    hasChainPanel,
    modalTitle: widgetMetadata.modalTitle,
    chainsPanelTitle: widgetMetadata.chainsPanelTitle,
    // Chain panel
    chainsState: chainsToSelect,
    onSelectChain,
    // Widget config
    displayLpTokenLists,
    tokenListCategoryState: widgetMetadata.tokenListCategoryState,
    disableErc20: widgetMetadata.disableErc20,
    isRouteAvailable,
    account,
    // Callbacks
    handleSelectToken: widgetDeps.handleSelectToken,
    onDismiss: widgetDeps.onDismiss,
    onOpenManageWidget: widgetDeps.openManageWidget,
    openPoolPage: widgetDeps.openPoolPage,
    onInputPressEnter: widgetState.onInputPressEnter,
  })
}

interface BuildViewPropsArgs {
  allTokenLists: ReturnType<typeof useTokenDataSources>['allTokenLists']
  chainsPanelTitle: string
  chainsToSelect: ReturnType<typeof useChainsToSelect>
  closeManageWidget: ReturnType<typeof useManageWidgetVisibility>['closeManageWidget']
  closePoolPage: ReturnType<typeof usePoolPageHandlers>['closePoolPage']
  importFlows: WidgetViewDependenciesResult['importFlows']
  isChainPanelEnabled: boolean
  onDismiss: () => void
  onSelectChain: ReturnType<typeof useOnSelectChain>
  selectTokenModalProps: SelectTokenModalProps
  selectedPoolAddress: ReturnType<typeof useSelectTokenWidgetState>['selectedPoolAddress']
  standalone: boolean | undefined
  tokenToImport: ReturnType<typeof useSelectTokenWidgetState>['tokenToImport']
  listToImport: ReturnType<typeof useSelectTokenWidgetState>['listToImport']
  isManageWidgetOpen: ReturnType<typeof useManageWidgetVisibility>['isManageWidgetOpen']
  userAddedTokens: ReturnType<typeof useTokenDataSources>['userAddedTokens']
  handleSelectToken: ReturnType<typeof useTokenSelectionHandler>
}

export function getSelectTokenWidgetViewPropsArgs(args: BuildViewPropsArgs): SelectTokenWidgetViewProps {
  const {
    standalone,
    tokenToImport,
    listToImport,
    isManageWidgetOpen,
    selectedPoolAddress,
    isChainPanelEnabled,
    chainsPanelTitle,
    chainsToSelect,
    onSelectChain,
    onDismiss,
    importFlows,
    allTokenLists,
    userAddedTokens,
    closeManageWidget,
    closePoolPage,
    selectTokenModalProps,
    handleSelectToken,
  } = args

  return {
    standalone,
    tokenToImport,
    listToImport,
    isManageWidgetOpen,
    selectedPoolAddress,
    isChainPanelEnabled,
    chainsPanelTitle,
    chainsToSelect,
    onSelectChain,
    onDismiss,
    onBackFromImport: importFlows.resetTokenImport,
    onImportTokens: importFlows.importTokenAndClose,
    onImportList: importFlows.importListAndBack,
    allTokenLists,
    userAddedTokens,
    onCloseManageWidget: closeManageWidget,
    onClosePoolPage: closePoolPage,
    selectTokenModalProps,
    onSelectToken: handleSelectToken,
  }
}
