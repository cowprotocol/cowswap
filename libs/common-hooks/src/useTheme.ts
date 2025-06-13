'use client'

import styled, { useTheme as styledUseTheme } from 'styled-components'

import type { DefaultTheme } from 'styled-components'

import '@cowprotocol/types'

// Re-export the theme hook with proper typing
export function useTheme(): DefaultTheme {
  return styledUseTheme()
}

// Re-export styled for convenience
export { styled }
