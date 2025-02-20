import { CowProtocolTheme } from '@cowprotocol/ui'

import { Fonts } from './styles'

export enum Theme {
  DARK = 'dark',
}

type ThemeMode = 'dark'

declare module 'styled-components' {
  export interface ExplorerTheme extends Fonts {
    mode: ThemeMode
  }

  export interface DefaultTheme extends CowProtocolTheme, ExplorerTheme {}
}
