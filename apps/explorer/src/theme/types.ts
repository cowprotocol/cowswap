import { Colors, Fonts } from './styles'

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

declare module 'styled-components' {
  export interface ExplorerTheme extends Colors, Fonts {
    // theming
    mode: 'light' | 'dark'
  }

  export interface DefaultTheme extends CowProtocolTheme, ExplorerTheme {}
}
