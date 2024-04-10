import React, { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { Text, TextProps as TextPropsOriginal } from 'rebass'
import styled, {
  css,
  DefaultTheme,
  DefaultThemeUniswap,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components/macro'

import { useIsDarkMode } from 'legacy/state/user/hooks'
import {
  colors as colorsBaseTheme,
  FixedGlobalStyle as FixedGlobalStyleBase,
  themeVariables as baseThemeVariables,
} from 'legacy/theme/baseTheme'

import { useInjectedWidgetPalette } from 'modules/injectedWidget'

import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'

import { mapWidgetTheme } from './mapWidgetTheme'
import { Colors } from './styled'

export type TextProps = Omit<TextPropsOriginal, 'css'> & { override?: boolean }

export const MEDIA_WIDTHS = {
  upToTiny: 320,
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
  upToLargeAlt: 1390,
  upToExtraLarge: 2560,
}

// Migrating to a standard z-index system https://getbootstrap.com/docs/5.0/layout/z-index/
// Please avoid using deprecated numbers
export enum Z_INDEX {
  deprecated_zero = 0,
  deprecated_content = 1,
  dropdown = 1000,
  sticky = 1020,
  fixed = 1030,
  modalBackdrop = 1040,
  offcanvas = 1050,
  modal = 1060,
  popover = 1070,
  tooltip = 1080,
}

export function colors(darkMode: boolean): Colors {
  return colorsBaseTheme(darkMode)
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

export function getTheme(darkMode: boolean): DefaultThemeUniswap {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  }
}

export const TextWrapper = styled(Text)<{ color: keyof Colors; override?: boolean }>`
  color: ${({ color, theme, override }) => {
    const colour = (theme as any)[color]
    if (colour && override) {
      return colour + '!important'
    } else {
      return colour
    }
  }};
`

/**
 * Preset styles of the Rebass Text component
 */
export const ThemedText = {
  Main(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Link(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Label(props: TextProps) {
    return <TextWrapper fontWeight={600} {...props} />
  },
  Black(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  White(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} {...props} />
  },
  LargeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  MediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  SubHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  Small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  Blue(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  DarkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Gray(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} {...props} />
  },
  Error({ ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
  Warn(props: TextProps) {
    return <TextWrapper fontWeight={500} {...props} />
  },
}

export function theme(darkmode: boolean, isInjectedWidgetMode: boolean): DefaultTheme {
  const colorsTheme = colors(darkmode)
  return {
    ...getTheme(darkmode),
    ...colorsTheme,
    isInjectedWidgetMode,

    // Override Theme
    ...baseThemeVariables(darkmode, colorsTheme),
    mediaWidth: mediaWidthTemplates,
  }
}

export default function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const injectedWidgetTheme = useInjectedWidgetPalette()

  const themeObject = useMemo(() => {
    const widgetMode = isInjectedWidget()
    const defaultTheme = theme(darkMode, widgetMode)

    if (widgetMode) {
      return mapWidgetTheme(injectedWidgetTheme, defaultTheme)
    }

    return defaultTheme
  }, [darkMode, injectedWidgetTheme])

  return (
    <>
      <ThemeFromUrlUpdater />
      <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
    </>
  )
}

export const FixedGlobalStyle = FixedGlobalStyleBase

export { ThemedGlobalStyle } from './baseTheme'
export * from './components'
