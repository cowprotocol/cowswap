import { useCallback, useRef } from 'react'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'

type CloseTokenSelectWidget = (options?: { overrideForceLock?: boolean }) => void

export function useCloseTokenSelectWidget(): CloseTokenSelectWidget {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const widgetState = useSelectTokenWidgetState()

  // Ref to read forceOpen at call-time, not capture-time
  // This makes the returned callback referentially stable
  const forceOpenRef = useRef(widgetState.forceOpen)

  // Synchronous update during render is intentional here:
  // - We need the latest forceOpen value available immediately when closeTokenSelectWidget is called
  // - Using useEffect would create a race condition where the ref has stale value during the same render cycle
  // - This is safe because we're only reading/writing a ref, not causing side effects
  // eslint-disable-next-line react-hooks/refs
  forceOpenRef.current = widgetState.forceOpen

  return useCallback(
    (options?: { overrideForceLock?: boolean }) => {
      if (forceOpenRef.current && !options?.overrideForceLock) return

      updateSelectTokenWidget(DEFAULT_SELECT_TOKEN_WIDGET_STATE)
    },
    [updateSelectTokenWidget],
  )
}
