import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { ListState } from '@cowprotocol/tokens'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useAddListImport() {
  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  return useCallback(
    (listToImport: ListState) => {
      updateSelectTokenWidget({
        listToImport,
      })
    },
    [updateSelectTokenWidget]
  )
}
