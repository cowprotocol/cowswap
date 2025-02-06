import type { CowProtocolTheme } from '@cowprotocol/ui'

declare module 'styled-components' {
  export interface CowSwapDefaultTheme extends CowProtocolTheme {
    /** @deprecated Use isWidget instead */
    isInjectedWidgetMode: boolean
  }

  export interface DefaultTheme extends CowSwapDefaultTheme {}
}
