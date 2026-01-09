import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState } from '@cowprotocol/tokens'

import { useDismissHandler } from './useDismissHandler'
import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { useTokenDataSources } from './useTokenDataSources'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'

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
