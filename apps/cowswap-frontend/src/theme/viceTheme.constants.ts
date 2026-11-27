import type { CowSwapTheme } from '@cowprotocol/ui'

import type { DefaultTheme } from 'styled-components/macro'

export const VICE_THEME: CowSwapTheme = 'darkVice'

/**
 * Overrides for the dark theme. `ThemeColorVars` replaces any text colour that misses AA on its
 * surface with plain black or white, so `primary` and `text` are kept above 4.5:1 on `paper`, and
 * `buttonTextCustom` above it on `primary`.
 */
export const VICE_THEME_PALETTE = {
  primary: '#F05D95',
  buttonTextCustom: '#1E002E',
  background: '#160028',
  paper: '#2A1145',
  text: '#FFE3EF',
  disabledText: '#A98BB5',
  info: '#6CB8F5',
  alert: '#F9B951',
  warning: '#EF884F',
  blue100Primary: '#1E002E',
  blue900Primary: '#FFD9E8',
} as const satisfies Partial<DefaultTheme>
