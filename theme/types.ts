import type { CowProtocolTheme } from '@cowprotocol/types'

declare module 'styled-components' {
  export interface CowFiDefaultTheme extends CowProtocolTheme {}

  export interface DefaultTheme extends CowFiDefaultTheme {}
}
