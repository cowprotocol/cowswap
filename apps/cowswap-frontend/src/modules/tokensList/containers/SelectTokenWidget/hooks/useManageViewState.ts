/**
 * useManageViewState - State for ManageListsAndTokens
 */
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState } from '@cowprotocol/tokens'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useTokenDataSources } from '../tokenDataHooks'
import { useDismissHandler, useManageWidgetVisibility } from '../widgetUIState'

export interface ManageViewState {
  lists: ListState[]
  customTokens: TokenWithLogo[]
  onDismiss: () => void
  onBack: () => void
}

export function useManageViewState(): ManageViewState | null {
  const { isManageWidgetOpen, closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const tokenData = useTokenDataSources()
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)

  if (!isManageWidgetOpen) return null

  return {
    lists: tokenData.allTokenLists,
    customTokens: tokenData.userAddedTokens,
    onDismiss,
    onBack: closeManageWidget,
  }
}
