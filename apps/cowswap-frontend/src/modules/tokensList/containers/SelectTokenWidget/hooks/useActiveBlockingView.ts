import { useManageWidgetVisibility } from './useManageWidgetVisibility'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

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
