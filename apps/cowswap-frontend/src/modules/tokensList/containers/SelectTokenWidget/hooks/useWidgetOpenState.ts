/**
 * useWidgetOpenState - Returns widget visibility and resets on close
 */
import { useEffect, useRef } from 'react'

import { useResetTokenListViewState } from '../../../hooks/useResetTokenListViewState'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

export function useWidgetOpenState(): boolean {
  const widgetState = useSelectTokenWidgetState()
  const isOpen = Boolean(widgetState.onSelectToken && (widgetState.open || widgetState.forceOpen))

  // Reset atom when modal closes
  const resetTokenListView = useResetTokenListViewState()
  const prevIsOpenRef = useRef(isOpen)

  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      resetTokenListView()
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, resetTokenListView])

  return isOpen
}
