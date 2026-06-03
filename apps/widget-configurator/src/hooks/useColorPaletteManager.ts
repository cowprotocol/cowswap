import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'

import { PaletteMode } from '@mui/material'

import { DEFAULT_DARK_PALETTE, DEFAULT_LIGHT_PALETTE } from '../configurator.constants'
import { ColorPalette } from '../configurator.types'

export interface ColorPaletteManager {
  defaultPalette: ColorPalette
  colorPalette: ColorPalette
  setColorPalette: Dispatch<SetStateAction<ColorPalette>>
  resetColorPalette(): void
}

export function useColorPaletteManager(
  mode: PaletteMode,
  customColorsByTheme: Record<PaletteMode, ColorPalette>,
  setCustomColorsByTheme: Dispatch<SetStateAction<Record<PaletteMode, ColorPalette>>>,
): ColorPaletteManager {
  const defaultPalette = useMemo(() => {
    return mode === 'dark' ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE
  }, [mode])

  const colorPalette = customColorsByTheme[mode]

  const setColorPalette = useCallback(
    (palette: ColorPalette | ((prevState: ColorPalette) => ColorPalette)) => {
      setCustomColorsByTheme((prevState) => {
        const currentPalette = prevState[mode]
        const newPalette = typeof palette === 'function' ? palette(currentPalette) : palette

        return {
          ...prevState,
          [mode]: newPalette,
        }
      })
    },
    [mode, setCustomColorsByTheme],
  )

  const resetColorPalette = useCallback(() => {
    setCustomColorsByTheme((prevState) => ({
      ...prevState,
      [mode]: defaultPalette,
    }))
  }, [defaultPalette, mode, setCustomColorsByTheme])

  return useMemo(
    () => ({ defaultPalette, colorPalette, setColorPalette, resetColorPalette }),
    [defaultPalette, colorPalette, setColorPalette, resetColorPalette],
  )
}
