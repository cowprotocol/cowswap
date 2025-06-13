import React from 'react'

import { Color } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'
import { BASE_STYLES } from 'styles'

const { borderRadius, buttonBorder, buttonFontSize } = BASE_STYLES

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<Element> {
  variant?: ButtonVariations
  size?: ButtonSizeVariations
}

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

// Pre-computed button variant styles
const BUTTON_VARIANT_STYLES = {
  default: css`
    color: ${Color.neutral100};
    background: ${Color.explorer_textActive};

    &:hover {
      background: ${Color.explorer_bgButtonHover};
    }
  `,
  primary: css`
    color: ${Color.neutral100};
    background: ${Color.explorer_textActive};

    &:hover {
      background: ${Color.explorer_bgButtonHover};
    }
  `,
  theme: css`
    color: ${Color.neutral100};
    background: ${Color.explorer_textActive};

    &:hover {
      background: ${Color.explorer_bgButtonHover};
    }
  `,
  secondary: css`
    color: ${Color.neutral100};
    background: ${Color.explorer_bgInput};
    border-color: ${Color.explorer_textActive};

    &:hover {
      color: ${Color.neutral100};
      background: ${Color.explorer_bgButtonHover};
    }
  `,
  success: css`
    color: ${Color.neutral100};
    background: ${Color.explorer_buttonSuccess};

    &:hover {
      background: ${Color.explorer_buttonSuccess};
      border-color: ${Color.explorer_buttonSuccess};
    }
  `,
  danger: css`
    color: ${Color.neutral100};
    background: ${Color.explorer_buttonDanger};

    &:hover {
      background: ${Color.explorer_buttonDanger};
      border-color: ${Color.explorer_buttonDanger};
    }
  `,
  warning: css`
    color: ${Color.neutral100};
    background: ${Color.explorer_buttonWarning};

    &:hover {
      background: ${Color.explorer_buttonWarning};
      border-color: ${Color.explorer_buttonWarning};
    }
  `,
  cancel: css`
    color: ${Color.neutral100};
    background: transparent;

    &:hover {
      color: ${Color.explorer_textButtonHover};
      background: ${Color.explorer_bgButtonHover};
    }
  `,
  disabled: css`
    color: ${Color.neutral70};
    background: ${Color.explorer_buttonDisabled};
  `,
} as const

// Pre-computed button size styles
const BUTTON_SIZE_STYLES = {
  small: css`
    font-size: 0.6rem;
    padding: 0.3rem 0.5rem;
  `,
  big: css`
    font-size: 1.4rem;
    padding: 0.65rem 1rem;
  `,
  default: css``,
} as const

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getButtonVariantStyles = (variant: ButtonVariations = 'default') => {
  return BUTTON_VARIANT_STYLES[variant]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getButtonSizeStyles = (size: ButtonSizeVariations = 'default') => {
  return BUTTON_SIZE_STYLES[size]
}

export const ButtonBase = styled.button<ButtonBaseProps>`
  border: ${buttonBorder};
  border-radius: ${borderRadius};
  font-size: ${buttonFontSize};
  padding: 0.5rem 1rem;
  cursor: ${({ disabled }): string => (disabled ? 'not-allowed' : 'pointer')};
  font-weight: bold;
  outline: 0;
  text-decoration: none;
  text-align: center;
  letter-spacing: 0.1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;

  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
  transition-property: color, background, border-color, opacity, margin;

  &:disabled,
  &[disabled] {
    pointer-events: none;
  }

  ${({ variant }) => getButtonVariantStyles(variant)}
  ${({ size }) => getButtonSizeStyles(size)}

  > svg {
    margin: 0 0.5rem 0 0;
  }
`
