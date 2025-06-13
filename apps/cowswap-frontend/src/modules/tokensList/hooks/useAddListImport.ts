import { useCallback } from 'react'

import { ListState } from '@cowprotocol/tokens'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
