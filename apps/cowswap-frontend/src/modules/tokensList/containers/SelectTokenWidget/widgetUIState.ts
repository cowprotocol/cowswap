import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { selectTokenModalUIAtom, updateSelectTokenModalUIAtom } from './atoms'

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
  const { isManageWidgetOpen } = useAtomValue(selectTokenModalUIAtom)
  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)

  const openManageWidget = useCallback(() => updateModalUI({ isManageWidgetOpen: true }), [updateModalUI])
  const closeManageWidget = useCallback(() => updateModalUI({ isManageWidgetOpen: false }), [updateModalUI])

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
