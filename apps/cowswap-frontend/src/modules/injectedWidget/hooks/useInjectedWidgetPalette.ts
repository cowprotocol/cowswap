import { useMemo } from 'react'

import { CowSwapWidgetPaletteParams } from '@cowprotocol/widget-lib'

import { useLocation } from 'react-router-dom'

// The theme palette provided by a consumer
export function useInjectedWidgetPalette(): Partial<CowSwapWidgetPaletteParams> | undefined {
  const { search } = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(search)
    const palette = searchParams.get('palette')

    if (!palette) return undefined

    try {
      return JSON.parse(decodeURIComponent(palette))
    } catch (e) {
      console.error('Failed to parse palette from URL', e)
    }
  }, [search])
}
