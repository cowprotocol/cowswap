import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useDismissHandler } from './useDismissHandler'
import { useImportTokenAndClose } from './useImportTokenAndClose'
import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { useResetTokenImport } from './useResetTokenImport'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

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

  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const importTokenAndClose = useImportTokenAndClose()
  const resetTokenImport = useResetTokenImport()

  return useMemo(() => {
    if (!widgetState.tokenToImport) return null

    return {
      token: widgetState.tokenToImport,
      onDismiss,
      onBack: resetTokenImport,
      onImport: importTokenAndClose,
    }
  }, [widgetState.tokenToImport, onDismiss, resetTokenImport, importTokenAndClose])
}
