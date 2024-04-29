import { useContext } from 'react'

import { ThemeContext } from 'styled-components/macro'

export function useTheme() {
  return useContext(ThemeContext)
}
