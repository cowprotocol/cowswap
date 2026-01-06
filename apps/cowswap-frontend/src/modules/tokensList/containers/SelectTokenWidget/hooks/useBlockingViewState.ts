/**
 * useBlockingViewState - Blocking view slot state (import/manage/pool)
 */
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState } from '@cowprotocol/tokens'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useOnTokenListAddingError } from '../../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'
import { useTokenAdminActions, useTokenDataSources } from '../tokenDataHooks'
import { useImportFlowCallbacks, useTokenSelectionHandler } from '../tokenSelectionHooks'
import { useDismissHandler, useManageWidgetVisibility, usePoolPageHandlers } from '../widgetUIState'

export interface BlockingViewState {
  hasBlockingView: boolean
  // Data
  standalone: boolean
  tokenToImport?: TokenWithLogo
  listToImport?: ListState
  isManageWidgetOpen: boolean
  selectedPoolAddress?: string
  allTokenLists: ListState[]
  userAddedTokens: TokenWithLogo[]
  // Handlers
  onDismiss: () => void
  onBackFromImport: () => void
  onImportTokens: (tokens: TokenWithLogo[]) => void
  onImportList: (list: ListState) => void
  onCloseManageWidget: () => void
  onClosePoolPage: () => void
  onSelectToken: (token: TokenWithLogo) => void
}

export function useBlockingViewState(): BlockingViewState {
  const widgetState = useSelectTokenWidgetState()
  const manageWidget = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const tokenData = useTokenDataSources()
  const tokenAdminActions = useTokenAdminActions()
  const onTokenListAddingError = useOnTokenListAddingError()

  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)
  const onDismiss = useDismissHandler(manageWidget.closeManageWidget, closeTokenSelectWidget)
  const { closePoolPage } = usePoolPageHandlers(updateSelectTokenWidget)

  const importFlows = useImportFlowCallbacks(
    tokenAdminActions.importTokenCallback,
    handleSelectToken,
    onDismiss,
    tokenAdminActions.addCustomTokenLists,
    onTokenListAddingError,
    updateSelectTokenWidget,
    tokenData.favoriteTokens,
  )

  const isStandalone = widgetState.standalone ?? false
  const hasBlockingView = Boolean(
    (widgetState.tokenToImport && !isStandalone) ||
      (widgetState.listToImport && !isStandalone) ||
      (manageWidget.isManageWidgetOpen && !isStandalone) ||
      widgetState.selectedPoolAddress,
  )

  return {
    hasBlockingView,
    standalone: isStandalone,
    tokenToImport: widgetState.tokenToImport,
    listToImport: widgetState.listToImport,
    isManageWidgetOpen: manageWidget.isManageWidgetOpen,
    selectedPoolAddress: widgetState.selectedPoolAddress,
    allTokenLists: tokenData.allTokenLists,
    userAddedTokens: tokenData.userAddedTokens,
    onDismiss,
    onBackFromImport: importFlows.resetTokenImport,
    onImportTokens: importFlows.importTokenAndClose,
    onImportList: importFlows.importListAndBack,
    onCloseManageWidget: manageWidget.closeManageWidget,
    onClosePoolPage: closePoolPage,
    onSelectToken: handleSelectToken,
  }
}
