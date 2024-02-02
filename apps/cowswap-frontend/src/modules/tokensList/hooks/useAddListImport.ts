import { useCallback } from 'react'

import { ListState } from '@cowprotocol/tokens'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

export function useAddListImport() {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (listToImport: ListState) => {
      updateSelectTokenWidget({
        listToImport,
      })
    },
    [updateSelectTokenWidget]
  )
}
