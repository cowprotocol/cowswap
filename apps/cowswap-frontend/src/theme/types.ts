import { CowProtocolTheme } from '@cowprotocol/ui'

import { TextProps as TextPropsOriginal } from 'rebass'

export type TextProps = Omit<TextPropsOriginal, 'css'> & { override?: boolean }

declare module 'styled-components' {
  /**
   * CoWSwap-specific theme extension that adds widget functionality
   * on top of the base CowProtocolTheme.
   */
  export interface CoWSwapTheme extends CowProtocolTheme {
    /** Properties specific to CoWSwap widget functionality */
    isWidget: boolean
    isIframe: boolean
  }

  // Use CoWSwapTheme as the default theme for styled-components in this app
  export interface DefaultTheme extends CoWSwapTheme {}
}
