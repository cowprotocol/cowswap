import { useCallback } from 'react'

import type { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'

type UpdateSelectTokenWidgetFn = ReturnType<typeof useUpdateSelectTokenWidgetState>

export interface PoolPageHandlers {
  openPoolPage(poolAddress: string): void
  closePoolPage(): void
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
