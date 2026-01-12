import { useAtomValue } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useDismissHandler } from './useDismissHandler'
import { useImportFlowCallbacks } from './useImportFlowCallbacks'
import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { useTokenAdminActions } from './useTokenAdminActions'
import { useTokenDataSources } from './useTokenDataSources'
import { useTokenSelectionHandler } from './useTokenSelectionHandler'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'
import { ImportRestriction, importRestrictionAtom } from '../atoms'

export interface ImportTokenViewState {
  token: TokenWithLogo
  restriction: ImportRestriction | null
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
  const importRestriction = useAtomValue(importRestrictionAtom)

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
    restriction: importRestriction,
    onDismiss,
    onBack: importFlows.resetTokenImport,
    onImport: importFlows.importTokenAndClose,
  }
}
