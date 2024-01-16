import { useContext } from 'react'

import { ThemeContext } from 'styled-components'

export function useTheme() {
  return useContext(ThemeContext)
}
