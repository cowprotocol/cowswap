import { useEffect, useState } from 'react'

import { CowSwapWidgetPaletteParams } from '@cowprotocol/widget-lib'

import { useLocation } from 'react-router'

// The theme palette provided by a consumer
export function useInjectedWidgetPalette(): Partial<CowSwapWidgetPaletteParams> | undefined {
  const { search } = useLocation()
  const [paletteParams, setPaletteParams] = useState<CowSwapWidgetPaletteParams | undefined>(undefined)

  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    const palette = searchParams.get('palette')

    // When the palette is not provided, then do nothing
    if (!palette) return undefined

    // Reset palette state when the value is null
    if (palette === 'null') {
      setPaletteParams(undefined)
      return
    }

    try {
      setPaletteParams(JSON.parse(decodeURIComponent(palette)))
    } catch (e) {
      console.error('Failed to parse palette from URL', e)
    }
  }, [search])

  return paletteParams
}
