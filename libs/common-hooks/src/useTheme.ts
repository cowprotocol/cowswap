import { useContext } from 'react'

import { ThemeContext } from 'styled-components/macro'

// TODO: Fix these type errors on build for cow-fi
// @ts-ignore
export function useTheme() {
  // @ts-ignore
  return useContext(ThemeContext)
}
