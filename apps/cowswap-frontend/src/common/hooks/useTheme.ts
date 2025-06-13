import { useContext } from 'react'

import { ThemeContext } from 'styled-components'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTheme() {
  return useContext(ThemeContext)
}
