import { useCallback } from 'react'

import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'

export function useResetTokenImport(): () => void {
  const updateWidget = useUpdateSelectTokenWidgetState()

  return useCallback(() => {
    updateWidget({ tokenToImport: undefined })
  }, [updateWidget])
}
