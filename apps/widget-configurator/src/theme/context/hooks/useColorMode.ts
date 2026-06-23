import { useContext } from 'react'

import { ColorModeContext, ColorModeContextValue } from '../ColorModeContext'

export function useColorMode(): ColorModeContextValue {
  const colorMode = useContext(ColorModeContext)

  if (!colorMode) {
    throw new Error('useColorMode must be used within ColorModeProvider')
  }

  return colorMode
}
