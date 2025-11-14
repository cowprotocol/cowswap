import { useCallback } from 'react'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'

type CloseTokenSelectWidget = (options?: { overrideForceLock?: boolean }) => void

export function useCloseTokenSelectWidget(): CloseTokenSelectWidget {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const widgetState = useSelectTokenWidgetState()

  return useCallback(
    (options?: { overrideForceLock?: boolean }) => {
      if (widgetState.forceOpen && !options?.overrideForceLock) return

      updateSelectTokenWidget(DEFAULT_SELECT_TOKEN_WIDGET_STATE)
    },
    [updateSelectTokenWidget, widgetState.forceOpen],
  )
}
