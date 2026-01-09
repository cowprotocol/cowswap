import { ListState } from '@cowprotocol/tokens'

import { useDismissHandler } from './useDismissHandler'
import { useImportFlowCallbacks } from './useImportFlowCallbacks'
import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { useTokenAdminActions } from './useTokenAdminActions'
import { useTokenDataSources } from './useTokenDataSources'
import { useTokenSelectionHandler } from './useTokenSelectionHandler'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useOnTokenListAddingError } from '../../../hooks/useOnTokenListAddingError'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'

export interface ImportListViewState {
  list: ListState
  onDismiss: () => void
  onBack: () => void
  onImport: (list: ListState) => void
}

export function useImportListViewState(): ImportListViewState | null {
  const widgetState = useSelectTokenWidgetState()
  const { closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const tokenData = useTokenDataSources()
  const tokenAdminActions = useTokenAdminActions()
  const onTokenListAddingError = useOnTokenListAddingError()

  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)

  const importFlows = useImportFlowCallbacks(
    tokenAdminActions.importTokenCallback,
    handleSelectToken,
    onDismiss,
    tokenAdminActions.addCustomTokenLists,
    onTokenListAddingError,
    updateSelectTokenWidget,
    tokenData.favoriteTokens,
  )

  if (!widgetState.listToImport) return null

  return {
    list: widgetState.listToImport,
    onDismiss,
    onBack: importFlows.resetTokenImport,
    onImport: importFlows.importListAndBack,
  }
}
