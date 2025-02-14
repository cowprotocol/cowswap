import type { CowProtocolTheme } from '@cowprotocol/ui'

declare module 'styled-components' {
  export interface DefaultTheme extends CowProtocolTheme {}
}
