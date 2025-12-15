import { useCallback, useState } from 'react'

import type { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

type UpdateSelectTokenWidgetFn = ReturnType<typeof useUpdateSelectTokenWidgetState>

interface ManageWidgetVisibility {
  isManageWidgetOpen: boolean
  openManageWidget(): void
  closeManageWidget(): void
}

interface PoolPageHandlers {
  openPoolPage(poolAddress: string): void
  closePoolPage(): void
}

export function useManageWidgetVisibility(): ManageWidgetVisibility {
  const [isManageWidgetOpen, setIsManageWidgetOpen] = useState(false)

  const openManageWidget = useCallback(() => setIsManageWidgetOpen(true), [])
  const closeManageWidget = useCallback(() => setIsManageWidgetOpen(false), [])

  return { isManageWidgetOpen, openManageWidget, closeManageWidget }
}

export function useDismissHandler(
  closeManageWidget: () => void,
  closeTokenSelectWidget: (options?: { overrideForceLock?: boolean }) => void,
): () => void {
  return useCallback(() => {
    closeManageWidget()
    closeTokenSelectWidget({ overrideForceLock: true })
  }, [closeManageWidget, closeTokenSelectWidget])
}

export function usePoolPageHandlers(updateSelectTokenWidget: UpdateSelectTokenWidgetFn): PoolPageHandlers {
  const openPoolPage = useCallback(
    (selectedPoolAddress: string) => {
      updateSelectTokenWidget({ selectedPoolAddress })
    },
    [updateSelectTokenWidget],
  )

  const closePoolPage = useCallback(() => {
    updateSelectTokenWidget({ selectedPoolAddress: undefined })
  }, [updateSelectTokenWidget])

  return { openPoolPage, closePoolPage }
}

