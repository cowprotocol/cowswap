import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useDismissHandler } from './useDismissHandler'
import { useManageWidgetVisibility } from './useManageWidgetVisibility'
import { usePoolPageHandlers } from './usePoolPageHandlers'
import { useTokenSelectionHandler } from './useTokenSelectionHandler'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'

export interface LpTokenViewState {
  poolAddress: string
  onDismiss: () => void
  onBack: () => void
  onSelectToken: (token: TokenWithLogo) => void
}

export function useLpTokenViewState(): LpTokenViewState | null {
  const widgetState = useSelectTokenWidgetState()
  const { closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  const handleSelectToken = useTokenSelectionHandler(widgetState.onSelectToken, widgetState)
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const { closePoolPage } = usePoolPageHandlers(updateSelectTokenWidget)

  return useMemo(() => {
    if (!widgetState.selectedPoolAddress) return null

    return {
      poolAddress: widgetState.selectedPoolAddress,
      onDismiss,
      onBack: closePoolPage,
      onSelectToken: handleSelectToken,
    }
  }, [widgetState.selectedPoolAddress, onDismiss, closePoolPage, handleSelectToken])
}
