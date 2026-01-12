import { useCallback } from 'react'

import { ListState } from '@cowprotocol/tokens'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

/**
 * Callback to set a list for import.
 * The actual consent/restriction logic is handled by the token selector's customFlows.
 */
export function useAddListImport(): (listToImport: ListState) => void {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (listToImport: ListState) => {
      updateSelectTokenWidget({ listToImport })
    },
    [updateSelectTokenWidget],
  )
}
