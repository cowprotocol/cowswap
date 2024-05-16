import React, { useContext } from 'react'

import { ThemeContext } from 'styled-components/macro'

export function useTheme() {
  return useContext(window !== undefined ? ThemeContext : React.createContext({}))
}
