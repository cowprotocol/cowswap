import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

import { PaletteMode } from '@mui/material'

import { DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from '../consts'
import { ColorPalette } from '../types'

const LOCAL_STORAGE_KEY_NAME = 'COW_WIDGET_PALETTE_'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getCachedPalette = (mode: PaletteMode) => {
  const cache = localStorage.getItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`)

  return cache ? JSON.parse(cache) : null
}

export interface ColorPaletteManager {
  defaultPalette: ColorPalette
  colorPalette: ColorPalette
  setColorPalette: Dispatch<SetStateAction<ColorPalette>>
  resetColorPalette(): void
}

export function useColorPaletteManager(mode: PaletteMode): ColorPaletteManager {
  const defaultPalette = useMemo(() => {
    return mode === 'dark' ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE
  }, [mode])

  const [colorPalette, updateColorPalette] = useState<ColorPalette>(getCachedPalette(mode) || defaultPalette)

  const persistPalette = useCallback(
    (colorPalette: ColorPalette) => {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`, JSON.stringify(colorPalette))
    },
    [mode]
  )

  const setColorPalette = useCallback(
    (palette: ColorPalette | ((prevState: ColorPalette) => ColorPalette)) => {
      const newPalette = typeof palette === 'function' ? palette(colorPalette) : palette

      updateColorPalette(newPalette)
      persistPalette(newPalette)
    },
    [colorPalette, persistPalette]
  )

  const resetColorPalette = useCallback(() => {
    setColorPalette(defaultPalette)
  }, [defaultPalette, setColorPalette])

  // Restore palette from localStorage when mode changes
  useEffect(() => {
    const newPalette = getCachedPalette(mode)

    updateColorPalette(newPalette || defaultPalette)
  }, [mode, defaultPalette])

  return useMemo(
    () => ({ defaultPalette, colorPalette, setColorPalette, resetColorPalette }),
    [defaultPalette, colorPalette, setColorPalette, resetColorPalette]
  )
}
