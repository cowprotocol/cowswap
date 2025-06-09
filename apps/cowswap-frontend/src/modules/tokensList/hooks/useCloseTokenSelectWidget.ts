import { useCallback } from 'react'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

import { DEFAULT_SELECT_TOKEN_WIDGET_STATE } from '../state/selectTokenWidgetAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCloseTokenSelectWidget() {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(() => {
    updateSelectTokenWidget(DEFAULT_SELECT_TOKEN_WIDGET_STATE)
  }, [updateSelectTokenWidget])
}
