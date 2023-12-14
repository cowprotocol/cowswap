import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

import { PaletteMode } from '@mui/material'

import { DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from '../consts'
import { ColorPalette } from '../types'

const LOCAL_STORAGE_KEY_NAME = 'COW_WIDGET_PALETTE_'

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
    const savedPalette = localStorage.getItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`)

    const newPalette = savedPalette ? JSON.parse(savedPalette) : defaultPalette

    updateColorPalette(newPalette)
  }, [mode, defaultPalette])

  return { defaultPalette, colorPalette, setColorPalette, resetColorPalette }
}
