import { ListState } from '@cowprotocol/tokens'

import { useDismissHandler } from './useDismissHandler'
import { useImportListAndBack } from './useImportListAndBack'
import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { useResetListImport } from './useResetListImport'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

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

  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const importListAndBack = useImportListAndBack()
  const resetListImport = useResetListImport()

  if (!widgetState.listToImport) return null

  return {
    list: widgetState.listToImport,
    onDismiss,
    onBack: resetListImport,
    onImport: importListAndBack,
  }
}
