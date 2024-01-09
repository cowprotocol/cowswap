import { ThemedCssFunction, DefaultTheme, CSSObject, css, FlattenSimpleInterpolation } from 'styled-components'

const PORTRAIT = 'portrait'
const LANDSCAPE = 'landscape'

// Use this to set the media widths
export const MEDIA_WIDTHS = {
  extraSmall: 500,
  small: 720,
  medium: 960,
  large: 1280,
}

// this builds our end media object that shouldn't be tweaked by us
const mediaQueriesObject = {
  upToExtraSmall: [0, MEDIA_WIDTHS.extraSmall, PORTRAIT],
  upToSmall: [0, MEDIA_WIDTHS.small, PORTRAIT],
  upToMedium: [0, MEDIA_WIDTHS.medium, PORTRAIT],
  upToLarge: [0, MEDIA_WIDTHS.large, PORTRAIT],

  tabletPortrait: [MEDIA_WIDTHS.small, MEDIA_WIDTHS.medium, PORTRAIT],
  tabletLandscape: [MEDIA_WIDTHS.small, MEDIA_WIDTHS.medium, LANDSCAPE],
}

type MediaWidthKeys = keyof typeof mediaQueriesObject

export type MediaWidth = {
  [key in MediaWidthKeys]: ThemedCssFunction<DefaultTheme>
}

export const mediaWidthTemplates = Object.keys(mediaQueriesObject).reduce<MediaWidth>(
  (accumulator, size: MediaWidthKeys) => {
    const [min, max, orientation] = mediaQueriesObject[size]
    accumulator[size] = (a: CSSObject, b: CSSObject, c: CSSObject): FlattenSimpleInterpolation =>
      css`
        @media (min-device-width: ${min}px) and (max-device-width: ${max}px),
          (min-device-width: ${min}px) and (max-device-width: ${max}px) and (orientation: ${orientation}) {
          ${css(a, b, c)}
        }
      `
    return accumulator
  },
  {} as MediaWidth,
)

type ThemeProps = {
  theme: DefaultTheme
}

/**
 * @name applyMediaStyles
 * @param mediaSize size to activate on
 * @example 
 *  applyMediaStyles('upToMedium')`
        flex-direction: row;
        justify-content: flex-start;
    `
 * @example {
 *  upToExtraSmall: 500,
 *  upToSmall: 720,
 *  upToMedium: 960,
 *  upToLarge: 1280,
 *  tabletPortrait: 720 to 960, orientation: portrait,
 *  tabletLandscape: 720 to 960, orientation: landscape,
 * }
 */
export const applyMediaStyles =
  (mediaSize: keyof MediaWidth) =>
  (stylesAndStuff: CSSObject | TemplateStringsArray) =>
  ({ theme }: ThemeProps): FlattenSimpleInterpolation =>
    theme.mq[mediaSize](stylesAndStuff)
