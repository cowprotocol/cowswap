import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState } from '@cowprotocol/tokens'

import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { useTokenDataSources } from './useTokenDataSources'

export interface ManageViewState {
  lists: ListState[]
  customTokens: TokenWithLogo[]
  onBack: () => void
}

export function useManageViewState(): ManageViewState | null {
  const { isManageWidgetOpen, closeManageWidget } = useManageWidgetVisibility()
  const tokenData = useTokenDataSources()

  if (!isManageWidgetOpen) return null

  return {
    lists: tokenData.allTokenLists,
    customTokens: tokenData.userAddedTokens,
    onBack: closeManageWidget,
  }
}
