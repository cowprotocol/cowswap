'use client'

import { createContext, useContext } from 'react'

import styled, { ThemeContext as StyledThemeContext } from 'styled-components/macro'

import type { Theme } from './theme'

// Create our own theme context with the correct type
const ThemeContext = createContext<Theme | null>(null)

// Export the context for the provider
export { ThemeContext }

// Re-export the styled object for consistency
export { styled }

export function useTheme(): Theme {
  // Try our custom context first
  const customTheme = useContext(ThemeContext)
  // Fallback to styled-components theme context
  const styledTheme = useContext(StyledThemeContext)

  const theme = customTheme || styledTheme

  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return theme as Theme
}
