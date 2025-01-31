import type { CowProtocolTheme } from '@cowprotocol/ui'

declare module 'styled-components' {
  export interface CowSwapDefaultTheme extends CowProtocolTheme {}

  export interface DefaultTheme extends CowSwapDefaultTheme {}
}
