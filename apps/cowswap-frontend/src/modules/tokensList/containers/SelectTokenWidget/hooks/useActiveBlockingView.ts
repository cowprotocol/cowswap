/**
 * useActiveBlockingView - Determines which blocking view should be shown
 */
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { useManageWidgetVisibility } from '../widgetUIState'

export type BlockingViewType = 'importToken' | 'importList' | 'manage' | 'lpToken' | null

export function useActiveBlockingView(): BlockingViewType {
  const widgetState = useSelectTokenWidgetState()
  const { isManageWidgetOpen } = useManageWidgetVisibility()
  const isStandalone = widgetState.standalone ?? false

  if (widgetState.tokenToImport && !isStandalone) return 'importToken'
  if (widgetState.listToImport && !isStandalone) return 'importList'
  if (isManageWidgetOpen && !isStandalone) return 'manage'
  if (widgetState.selectedPoolAddress) return 'lpToken'

  return null
}
