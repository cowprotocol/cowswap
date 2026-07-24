import { CowProtocolTheme } from '@cowprotocol/ui'

import { Fonts } from './styles'

export enum Theme {
  DARK = 'dark',
}

type ThemeMode = 'dark'

declare module 'styled-components' {
  export interface DefaultTheme extends CowProtocolTheme, ExplorerTheme {}

  export interface ExplorerTheme extends Fonts {
    mode: ThemeMode
  }
}
