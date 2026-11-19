import { ReactNode, useMemo } from 'react'

import { ThemeProvider as StyledComponentsThemeProvider, useTheme } from 'styled-components/macro'
import { CustomThemeColorVars } from 'theme'
import { VICE_THEME, VICE_THEME_PALETTE } from 'theme/viceTheme.constants'

import { useAppTheme } from '../../hooks/useAppTheme'

interface CustomThemeProviderProps {
  children: ReactNode
}

/**
 * Lays a custom theme's palette over the app theme in the render that resolves the custom theme.
 * Its page scene is drawn from that same render, so colours and scene reach the screen in one
 * frame. Applied through the theme atom instead, the colours follow a render later and the frame
 * in between shows the scene in the wrong colours.
 */
export function CustomThemeProvider({ children }: CustomThemeProviderProps): ReactNode {
  const appTheme = useAppTheme()
  const baseTheme = useTheme()
  const hasPalette = appTheme === VICE_THEME

  const theme = useMemo(
    () => (hasPalette ? { ...baseTheme, ...VICE_THEME_PALETTE } : baseTheme),
    [hasPalette, baseTheme],
  )

  return (
    <StyledComponentsThemeProvider theme={theme}>
      {hasPalette && <CustomThemeColorVars />}
      {children}
    </StyledComponentsThemeProvider>
  )
}
