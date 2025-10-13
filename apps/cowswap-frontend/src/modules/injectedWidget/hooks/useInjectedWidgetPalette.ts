import { useMemo } from 'react'

import { CowSwapWidgetPaletteParams } from '@cowprotocol/widget-lib'

import { useLocation } from 'react-router'

// The theme palette provided by a consumer
export function useInjectedWidgetPalette(): Partial<CowSwapWidgetPaletteParams> | undefined {
  const { search } = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(search)
    const palette = searchParams.get('palette')

    // When the palette is not provided, then do nothing
    if (!palette) return undefined

    // Reset palette state when the value is null
    if (palette === 'null') {
      return undefined
    }

    try {
      return JSON.parse(decodeURIComponent(palette))
    } catch (e) {
      console.error('Failed to parse palette from URL', e)
    }

    return undefined
  }, [search])
}
