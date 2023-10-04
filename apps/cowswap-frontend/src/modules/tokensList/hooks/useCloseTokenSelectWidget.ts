import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useCloseTokenSelectWidget() {
  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  return useCallback(() => {
    updateSelectTokenWidget({
      open: false,
      onSelectToken: undefined,
      tokenToImport: undefined,
    })
  }, [updateSelectTokenWidget])
}
