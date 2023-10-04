import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useResetTokenImport() {
  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  return useCallback(() => {
    updateSelectTokenWidget({
      tokenToImport: undefined,
    })
  }, [updateSelectTokenWidget])
}
