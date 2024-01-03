import { Colors, Fonts, MediaWidth } from './styles'

export enum Theme {
  DARK = 'DARK',
  LIGHT = 'LIGHT',
}

export const THEME_LIST = Object.entries(Theme)

declare module 'styled-components' {
  export interface DefaultTheme extends DefaultThemeAliases, Colors, Fonts {
    // theming
    mode: Theme
    // used to key in on component variants
    componentKey?: keyof JSX.IntrinsicElements
    /**
     * @name mediaQueries
     *
     * @example theme.mediaQueries.upToMedium` font-size: larger; color: red; `
     *
     * @example {
     *  upToExtraSmall: 500,
     *  upToSmall: 720,
     *  upToMedium: 960,
     *  upToLarge: 1280,
     *  tabletPortrait: 720 to 960, orientation: portrait,
     *  tabletLandscape: 720 to 960, orientation: landscape,
     * }
     */
    mediaQueries: MediaWidth
  }
  interface DefaultThemeAliases {
    /**
     * @name mq - alias for mediaQueries
     *
     * @example theme.mq.upToMedium` font-size: larger; color: red; `
     *
     * @example {
     *  upToExtraSmall: 500,
     *  upToSmall: 720,
     *  upToMedium: 960,
     *  upToLarge: 1280,
     *  tabletPortrait: 720 to 960, orientation: portrait,
     *  tabletLandscape: 720 to 960, orientation: landscape,
     * }
     */
    mq: DefaultTheme['mediaQueries']
  }
}
