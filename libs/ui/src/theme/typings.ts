import type { CowProtocolTheme } from '@cowprotocol/types'

declare module 'styled-components' {
  export interface DefaultTheme extends CowProtocolTheme {}
}
