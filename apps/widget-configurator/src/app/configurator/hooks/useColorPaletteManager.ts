import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

import { PaletteMode } from '@mui/material'

import { DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from '../consts'
import { ColorPalette } from '../types'

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

  const [colorPalette, updateColorPalette] = useState<ColorPalette>(defaultPalette)

  const setColorPalette = useCallback(
    (palette: ColorPalette | ((prevState: ColorPalette) => ColorPalette)) => {
      const newPalette = typeof palette === 'function' ? palette(colorPalette) : palette
      updateColorPalette(newPalette)
    },
    [colorPalette]
  )

  const resetColorPalette = useCallback(() => {
    setColorPalette(defaultPalette)
  }, [defaultPalette, setColorPalette])

  // Reset palette when mode changes
  useEffect(() => {
    updateColorPalette(defaultPalette)
  }, [mode, defaultPalette])

  return useMemo(
    () => ({ defaultPalette, colorPalette, setColorPalette, resetColorPalette }),
    [defaultPalette, colorPalette, setColorPalette, resetColorPalette]
  )
}