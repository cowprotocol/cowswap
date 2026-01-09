import { useCallback } from 'react'

export function useDismissHandler(
  closeManageWidget: () => void,
  closeTokenSelectWidget: (options?: { overrideForceLock?: boolean }) => void,
): () => void {
  return useCallback(() => {
    closeManageWidget()
    closeTokenSelectWidget({ overrideForceLock: true })
  }, [closeManageWidget, closeTokenSelectWidget])
}
