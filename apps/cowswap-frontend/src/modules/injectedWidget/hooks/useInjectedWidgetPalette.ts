import { useMemo } from 'react'

import { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { useLocation } from 'react-router'

/**
 * Palette from the widget URL query string.
 *
 * - No param (`palette === null`): Keep the last applied custom palette.
 * - Explicitly set to null (`palette === "null"`): Reset to the default theme.
 * - Unparseable `palette` value: Reset to the default theme.
 * - object: custom palette JSON from the host.
 */
export function useInjectedWidgetPalette(): Partial<CowSwapWidgetPalette> | null | undefined {
  const { search } = useLocation()

  return useMemo(() => {
    const searchParams = new URLSearchParams(search)
    const palette = searchParams.get('palette')

    // When the palette param is absent, do not change the current palette state.
    if (palette === null) {
      return undefined
    }

    // Explicit reset to defaults (see widget-lib `addThemePaletteToQuery`).
    if (palette === 'null') {
      return null
    }

    try {
      return JSON.parse(decodeURIComponent(palette)) as Partial<CowSwapWidgetPalette>
    } catch (e) {
      console.error('Failed to parse palette from URL', e)
      return null
    }
  }, [search])
}
