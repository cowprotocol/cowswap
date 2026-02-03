import { useManageWidgetVisibility } from './useManageWidgetVisibility'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { TokenSelectorView } from '../types'

export function useActiveBlockingView(): TokenSelectorView {
  const widgetState = useSelectTokenWidgetState()
  const { isManageWidgetOpen } = useManageWidgetVisibility()
  const isStandalone = widgetState.standalone ?? false

  if (widgetState.tokenToImport && !isStandalone) return TokenSelectorView.ImportToken
  if (widgetState.listToImport && !isStandalone) return TokenSelectorView.ImportList
  if (isManageWidgetOpen && !isStandalone) return TokenSelectorView.Manage
  if (widgetState.selectedPoolAddress) return TokenSelectorView.LpToken

  return TokenSelectorView.Main
}
