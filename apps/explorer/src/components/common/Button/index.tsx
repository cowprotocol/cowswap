import React from 'react'
import styled, { css } from 'styled-components'
import { ThemeValue, variants } from 'styled-theming'

import { COLOURS, BASE_STYLES } from 'styles'
import ThemeProvider, { Theme } from 'theme'

const {
  white,
  whiteDark,
  blue,
  blueDark,
  successLight,
  successDark,
  warningLight,
  warningDark,
  dangerLight,
  dangerDark,
  bgLight,
  bgDark,
  mainGradient,
  mainGradientDarker,
  disabledLight,
  disabledLightOpaque,
} = COLOURS

const { borderRadius, buttonBorder, buttonFontSize } = BASE_STYLES

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<Element> {
  variant?: ButtonVariations
  size?: ButtonSizeVariations
}

// Used in stories
// Good to keep around altough not required
export type ButtonVariations =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'cancel'
  | 'disabled'
  | 'theme'

export type ButtonSizeVariations = 'default' | 'small' | 'big'

// Create our variated Button Theme
// 'kind' refers to a prop on button
// <ButtonBase kind="danger" />
export const ButtonTheme = variants('mode', 'variant', {
  default: {
    [Theme.LIGHT]: css`
      color: ${white};
      background: ${mainGradient};

      &:hover {
        background: ${mainGradientDarker};
      }
    `,
    [Theme.DARK]: css`
      color: ${white};
      background: ${mainGradient};

      &:hover {
        background: ${mainGradientDarker};
      }
    `,
  },
  get primary() {
    return this.default
  },
  secondary: {
    [Theme.LIGHT]: css`
      color: ${blue};
      background: ${bgLight};
      border-color: ${blue};

      &:hover {
        background: ${bgDark};
      }
    `,
    [Theme.DARK]: css`
      color: ${blue};
      background: ${bgDark};
      border-color: ${blue};

      &:hover {
        color: ${white};
        background: ${blue};
      }
    `,
  },
  success: {
    [Theme.LIGHT]: css`
      color: ${white};
      background: ${successLight};

      &:hover {
        background: ${successDark};
        border-color: ${successDark};
      }
    `,
    [Theme.DARK]: css`
      color: ${white};
      background: ${successDark};

      &:hover {
        background: ${successLight};
        border-color: ${successLight};
      }
    `,
  },
  danger: {
    [Theme.LIGHT]: css`
      color: ${white};
      background: ${dangerLight};

      &:hover {
        background: ${dangerDark};
        border-color: ${dangerDark};
      }
    `,
    [Theme.DARK]: css`
      color: ${white};
      background: ${dangerDark};

      &:hover {
        background: ${dangerLight};
        border-color: ${dangerLight};
      }
    `,
  },
  warning: {
    [Theme.LIGHT]: css`
      color: ${white};
      background: ${warningLight};

      &:hover {
        background: ${warningDark};
        border-color: ${warningDark};
      }
    `,
    [Theme.DARK]: css`
      color: ${white};
      background: ${warningDark};

      &:hover {
        background: ${warningLight};
        border-color: ${warningLight};
      }
    `,
  },
  cancel: {
    [Theme.LIGHT]: css`
      color: ${white};
      background: transparent;

      &:hover {
        background: ${blueDark};
      }
    `,
    [Theme.DARK]: css`
      color: ${blue};
      background: transparent;

      &:hover {
        color: ${whiteDark};
        background: ${blueDark};
      }
    `,
  },
  disabled: {
    [Theme.DARK]: css`
      color: ${disabledLightOpaque};
      background: ${disabledLight};
    `,
    get light(): ThemeValue {
      return this.dark
    },
  },
  theme: {
    [Theme.LIGHT]: css`
      color: ${white};
      background: lightsalmon;

      &:hover {
        color: ghostwhite;
        background: darkorange;
      }
    `,
    [Theme.DARK]: css`
      color: ghostwhite;
      background: purple;

      &:hover {
        color: ${white};
        background: darkpurple;
      }
    `,
  },
})

// Created a 'size' prop on buttons, default | small | big
const ButtonSizes = variants('componentKey', 'size', {
  default: {
    button: '',
  },
  small: {
    button: css`
      font-size: 0.6rem;
      padding: 0.3rem 0.5rem;
    `,
  },
  big: {
    button: css`
      font-size: 1.4rem;
      padding: 0.65rem 1rem;
    `,
  },
})

const ColouredButtonBase = styled.button`
  border: ${buttonBorder};
  /* Fold in theme css above */
  ${ButtonTheme}
`

const ColouredAndSizedButtonBase = styled(ColouredButtonBase)`
  font-size: ${buttonFontSize};
  ${ButtonSizes}
`
// Wrap ColouredAndSizedButtonsBase in it's own ThemeProvider which takes the toplevel app theme
// ThemeProvider and interpolate over it's props
const ThemeWrappedButtonBase: React.FC<React.ButtonHTMLAttributes<Element>> = ({ children, ...restProps }) => (
  <ThemeProvider componentKey="button">
    <ColouredAndSizedButtonBase {...restProps}>{children}</ColouredAndSizedButtonBase>
  </ThemeProvider>
)

export const ButtonBase = styled(ThemeWrappedButtonBase)<ButtonBaseProps>`
  border-radius: ${borderRadius};
  cursor: pointer;
  font-weight: bold;
  outline: 0;
  padding: 0.5rem 1rem;

  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
  transition-property: color, background, border-color, opacity, margin;

  &:disabled,
  &[disabled] {
    pointer-events: none;
  }
`

const ThemeButtonToggleWrapper = styled.div<{ $mode: boolean }>`
  display: inline-flex;
  width: 5rem;
  background-color: gainsboro;
  border-radius: 2rem;

  > button {
    width: 75%;
    margin-left: ${({ $mode }): string => ($mode ? 'auto' : '0')};
  }
`

export const ThemeToggle: React.FC<
  ButtonBaseProps & {
    mode: boolean
  }
> = ({ mode, size = 'small', variant = 'theme', children, ...rest }) => {
  return (
    <ThemeButtonToggleWrapper $mode={mode}>
      <ButtonBase {...rest} size={size} variant={variant}>
        {children}
      </ButtonBase>
    </ThemeButtonToggleWrapper>
  )
}
