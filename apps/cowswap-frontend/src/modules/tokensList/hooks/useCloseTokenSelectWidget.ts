import { useCallback } from 'react'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'

export function useCloseTokenSelectWidget() {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(() => {
    updateSelectTokenWidget(DEFAULT_SELECT_TOKEN_WIDGET_STATE)
  }, [updateSelectTokenWidget])
}
