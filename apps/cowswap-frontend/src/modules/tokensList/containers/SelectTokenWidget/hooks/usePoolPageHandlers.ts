import { useCallback, useMemo } from 'react'

import type { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'

export interface PoolPageHandlers {
  openPoolPage(poolAddress: string): void
  closePoolPage(): void
}

type UpdateSelectTokenWidgetFn = ReturnType<typeof useUpdateSelectTokenWidgetState>

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

  return useMemo(() => ({ openPoolPage, closePoolPage }), [openPoolPage, closePoolPage])
}
