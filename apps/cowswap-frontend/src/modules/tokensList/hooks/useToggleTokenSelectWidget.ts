import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useToggleTokenSelectWidget() {
  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  return useCallback(() => {
    updateSelectTokenWidget((prev) => ({ open: !prev.open }))
  }, [updateSelectTokenWidget])
}
