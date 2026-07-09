import { createContext } from 'react'

import { PaletteMode } from '@mui/material'

export interface ColorModeContextValue {
  mode: PaletteMode
  toggleColorMode(): void
}

export const ColorModeContext = createContext<ColorModeContextValue | null>(null)
