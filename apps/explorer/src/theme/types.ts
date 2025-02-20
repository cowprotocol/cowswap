import { Fonts } from './styles'

import type { CowProtocolTheme } from 'styled-components/macro'

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
