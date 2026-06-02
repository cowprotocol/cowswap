import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useManageWidgetVisibility } from './useManageWidgetVisibility'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { TokenSelectorView } from '../types'

export function useActiveBlockingView(): TokenSelectorView {
  const widgetState = useSelectTokenWidgetState()
  const { isManageWidgetOpen } = useManageWidgetVisibility()
  const { disableTokenImport } = useInjectedWidgetParams()
  const isStandalone = widgetState.standalone ?? false
  const canManageTokenLists = !isStandalone && !disableTokenImport

  if (canManageTokenLists) {
    if (widgetState.tokenToImport) return TokenSelectorView.ImportToken
    if (widgetState.listToImport) return TokenSelectorView.ImportList
    if (isManageWidgetOpen) return TokenSelectorView.Manage
  }
  if (widgetState.selectedPoolAddress) return TokenSelectorView.LpToken

  return TokenSelectorView.Main
}
