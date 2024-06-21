import React, { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import {
  colors as colorsBaseTheme,
  Colors,
  FixedGlobalStyle as FixedGlobalStyleBase,
  Media,
  ThemeColorsGlobalStyle,
  themeMapper,
  UI,
} from '@cowprotocol/ui'

import { Text, TextProps as TextPropsOriginal } from 'rebass'
import styled, {
  createGlobalStyle,
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components/macro'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useInjectedWidgetPalette } from 'modules/injectedWidget'

import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'

import { mapWidgetTheme } from './mapWidgetTheme'

export type TextProps = Omit<TextPropsOriginal, 'css'> & { override?: boolean }

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
  return themeMapper(darkmode ? 'dark' : 'light', isInjectedWidgetMode)
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

export const ThemedGlobalStyle = createGlobalStyle`
  ${ThemeColorsGlobalStyle}

  html {
    background-color: ${({ theme }) =>
      theme.isInjectedWidgetMode ? 'transparent' : `var(${UI.COLOR_CONTAINER_BG_02})`};
  }

  *, *:after, *:before { box-sizing:border-box; }

  body {

    &.noScroll {
      overflow: hidden;
    }
  }

  ::selection {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }

  // TODO: Can be removed once we control this component
  [data-reach-dialog-overlay] {
    z-index: 10!important;

    ${Media.upToMedium()} {
      top: 0!important;
      bottom: 0!important;
    }
  }

  // Appzi Container override
  div[id*='appzi-wfo-'] {
    display: none!important; // Force hiding Appzi container when not opened
  }

  body[class*='appzi-f-w-open-'] div[id^='appzi-wfo-'] {
    z-index: 2147483004!important;
    display: block!important;
  }

    // Walletconnect V2 mobile override
  body #wcm-modal.wcm-overlay {
    ${Media.upToSmall()} {
      align-items: flex-start;
    }

    a {
      text-decoration: none;

      :hover {
        text-decoration: underline;
      }
    }
  }
`

export * from './components'
