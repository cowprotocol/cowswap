import { useCallback } from 'react'

import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'

export function useResetListImport(): () => void {
  const updateWidget = useUpdateSelectTokenWidgetState()

  return useCallback(() => {
    updateWidget({ listToImport: undefined })
  }, [updateWidget])
}
