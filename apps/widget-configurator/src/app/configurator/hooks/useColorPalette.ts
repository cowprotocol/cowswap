import { useState, useEffect, useCallback, useRef } from 'react'

import { PaletteMode } from '@mui/material'
import debounce from 'lodash/debounce'

import { DEFAULT_LIGHT_PALETTE, DEFAULT_DARK_PALETTE } from '../consts'

type ColorKeys = 'primary' | 'secondary' | 'background' | 'paper' | 'text' | 'error' | 'warning' | 'info' | 'success'

export type ColorPalette = {
  [key in ColorKeys]: string
}

export const LOCAL_STORAGE_KEY_NAME = 'cow_widget_palette_'
const DEBOUNCE_TIME = 1000

export const useColorPalette = (mode: PaletteMode): [ColorPalette, (newPalette: ColorPalette) => void, () => void] => {
  // Helper function to check if a value is a valid HEX color string
  const isStringAndValidColor = (color: string | null): boolean => {
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

    return typeof color === 'string' && hexColorRegex.test(color)
  }

  const getPaletteFromLocalStorage = useCallback((defaultPalette: ColorPalette, mode: PaletteMode): ColorPalette => {
    try {
      const savedColors = localStorage.getItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`)
      if (!savedColors) return defaultPalette

      const parsedColors = JSON.parse(savedColors)
      // Validate that each color value is a string and a valid color
      for (const key in parsedColors) {
        if (!isStringAndValidColor(parsedColors[key])) {
          // If any color value is invalid, return the default palette
          return defaultPalette
        }
      }
      return parsedColors
    } catch (error) {
      console.error('Error reading from localStorage', error)
      return defaultPalette
    }
  }, []) // If this function doesn't depend on external state/props, keep this array empty

  const initialPaletteRef = useRef<ColorPalette | null>(null)
  const prevModeRef = useRef<PaletteMode | null>(null)

  useEffect(() => {
    initialPaletteRef.current = getPaletteFromLocalStorage(
      mode === 'dark' ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE,
      mode
    )
    prevModeRef.current = mode
  }, [mode, getPaletteFromLocalStorage])

  const [shouldUpdateLocalStorage, setShouldUpdateLocalStorage] = useState(true)
  const [lightColors, setLightColors] = useState<ColorPalette>(
    getPaletteFromLocalStorage(DEFAULT_LIGHT_PALETTE, 'light')
  )
  const [darkColors, setDarkColors] = useState<ColorPalette>(getPaletteFromLocalStorage(DEFAULT_DARK_PALETTE, 'dark'))

  const handleColorPaletteChange = (newPalette: ColorPalette) => {
    if (mode === 'dark') {
      setDarkColors(newPalette)
    } else {
      setLightColors(newPalette)
    }
    setShouldUpdateLocalStorage(true) // Enable localStorage update

    console.log('handleColorPaletteChange: newPalette => ', newPalette)
    console.log('handleColorPaletteChange: mode => ', mode)
    console.log('handleColorPaletteChange shouldUpdateLocalStorage => ', shouldUpdateLocalStorage)
  }

  const isColorKey = (key: string): key is ColorKeys => {
    return ['primary', 'secondary', 'background', 'paper', 'text', 'error', 'warning', 'info', 'success'].includes(key)
  }

  const updateLocalStorage = useCallback(
    (newColors: ColorPalette) => {
      // Compare newColors with default palette
      const defaultPalette = mode === 'dark' ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE
      const customValues = Object.fromEntries(
        Object.entries(newColors).filter(([key, value]) => isColorKey(key) && value !== defaultPalette[key])
      )

      if (Object.keys(customValues).length > 0) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`, JSON.stringify(customValues))
      } else {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`)
      }

      console.log('updateLocalStorage: newColors => ', newColors)
      console.log('updateLocalStorage: mode => ', mode)
      console.log('updateLocalStorage: customValues => ', customValues)
      console.log('updateLocalStorage: defaultPalette => ', defaultPalette)
      console.log('updateLocalStorage: Object.keys(customValues).length => ', Object.keys(customValues).length)
    },
    [mode]
  )

  useEffect(() => {
    const colorPalette = mode === 'dark' ? darkColors : lightColors

    if (shouldUpdateLocalStorage && prevModeRef.current === mode) {
      const debouncedUpdate = debounce(() => {
        updateLocalStorage(colorPalette)
        setShouldUpdateLocalStorage(false)
      }, DEBOUNCE_TIME)

      debouncedUpdate()
      return () => debouncedUpdate.cancel()
    }
    // Ensure a function is always returned
    return () => {}
  }, [darkColors, lightColors, mode, updateLocalStorage, shouldUpdateLocalStorage])

  const setColorPalette = useCallback(
    (newPalette: ColorPalette) => {
      if (mode === 'dark') {
        setDarkColors(newPalette)
      } else {
        setLightColors(newPalette)
      }
      setShouldUpdateLocalStorage(true) // Enable localStorage update
    },
    [mode]
  )

  const resetColorPalette = () => {
    setColorPalette(mode === 'dark' ? DEFAULT_DARK_PALETTE : DEFAULT_LIGHT_PALETTE)
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_NAME}${mode}`)
    setShouldUpdateLocalStorage(false)
  }

  return [mode === 'dark' ? darkColors : lightColors, handleColorPaletteChange, resetColorPalette]
}
