import { useMemo } from 'react'

import { CowSwapWidgetPaletteParams, paletteKeyToQueryParam, WIDGET_PALETTE_COLORS } from '@cowprotocol/widget-lib'

import { useLocation } from 'react-router-dom'

// The theme palette provided by a consumer
export function useInjectedWidgetPalette(): Partial<CowSwapWidgetPaletteParams> | undefined {
  const { search } = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(search)

    return WIDGET_PALETTE_COLORS.reduce<Partial<CowSwapWidgetPaletteParams>>((acc, param) => {
      const queryKey = paletteKeyToQueryParam(param)
      const value = searchParams.get(queryKey)

      if (!value) return acc

      return {
        ...acc,
        [param]: searchParams.get(queryKey),
      }
    }, {})
  }, [search])
}
