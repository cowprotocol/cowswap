import type { CowProtocolTheme } from '@cowprotocol/ui'

declare module 'styled-components' {
  export interface CowFiDefaultTheme extends CowProtocolTheme {}

  export interface DefaultTheme extends CowFiDefaultTheme {}
}
