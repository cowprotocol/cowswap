/**
 * useImportTokenViewState - State for ImportTokenModal
 */
import { TokenWithLogo } from '@cowprotocol/common-const'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'
import { useTokenAdminActions, useTokenDataSources } from '../tokenDataHooks'
import { useImportFlowCallbacks, useTokenSelectionHandler } from '../tokenSelectionHooks'
import { useDismissHandler, useManageWidgetVisibility } from '../widgetUIState'

export interface ImportTokenViewState {
  token: TokenWithLogo
  onDismiss: () => void
  onBack: () => void
  onImport: (tokens: TokenWithLogo[]) => void
}

export function useImportTokenViewState(): ImportTokenViewState | null {
  const widgetState = useSelectTokenWidgetState()
  const { closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const tokenData = useTokenDataSources()
  const tokenAdminActions = useTokenAdminActions()

  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)

  const importFlows = useImportFlowCallbacks(
    tokenAdminActions.importTokenCallback,
    handleSelectToken,
    onDismiss,
    tokenAdminActions.addCustomTokenLists,
    () => {}, // onTokenListAddingError not needed for token import
    updateSelectTokenWidget,
    tokenData.favoriteTokens,
  )

  if (!widgetState.tokenToImport) return null

  return {
    token: widgetState.tokenToImport,
    onDismiss,
    onBack: importFlows.resetTokenImport,
    onImport: importFlows.importTokenAndClose,
  }
}
