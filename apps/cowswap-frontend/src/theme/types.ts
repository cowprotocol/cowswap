import { CowProtocolTheme, CowSwapTheme } from '@cowprotocol/ui'

declare module 'styled-components' {
  /**
   * CoWSwap-specific theme extension that adds widget functionality
   * on top of the base CowProtocolTheme.
   */
  export interface CoWSwapTheme extends CowProtocolTheme {
    /** Properties specific to CoWSwap widget functionality */
    isWidget: boolean
    isIframe: boolean
    /** The custom theme whose palette is laid over this theme, if any. */
    customTheme?: CowSwapTheme
  }

  // Use CoWSwapTheme as the default theme for styled-components in this app
  export interface DefaultTheme extends CoWSwapTheme {}
}
