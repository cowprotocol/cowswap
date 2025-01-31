import type { CowProtocolTheme } from '@cowprotocol/ui'

import { Colors, Fonts } from './styles'

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

declare module 'styled-components' {
  export interface ExplorerTheme extends Colors, Fonts {
    // theming
    mode: 'light' | 'dark'
    isInjectedWidgetMode: boolean
    isStandalone: boolean
    isWidget: boolean
    isIframe: boolean
    isLimitOrder: boolean
    isSwapOrder: boolean
    isTwapOrder: boolean
    isAdvancedOrder: boolean
  }

  export interface DefaultTheme extends CowProtocolTheme, ExplorerTheme {}
}
