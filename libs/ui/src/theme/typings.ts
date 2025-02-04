import type { Colors, CowProtocolTheme, CowSwapTheme, ThemeUtils } from '@cowprotocol/types'

export type { Colors, CowProtocolTheme, CowSwapTheme, ThemeUtils }

declare module 'styled-components' {
  export interface DefaultTheme extends CowProtocolTheme {}
}
