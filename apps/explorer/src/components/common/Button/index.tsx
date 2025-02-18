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

const getButtonVariantStyles = (variant: ButtonVariations = 'default') => {
  switch (variant) {
    case 'default':
    case 'primary':
    case 'theme':
      return css`
        color: ${Color.neutral100};
        background: ${Color.explorer_textActive};

        &:hover {
          background: ${Color.explorer_bgButtonHover};
        }
      `
    case 'secondary':
      return css`
        color: ${Color.neutral100};
        background: ${Color.explorer_bgInput};
        border-color: ${Color.explorer_textActive};

        &:hover {
          color: ${Color.neutral100};
          background: ${Color.explorer_bgButtonHover};
        }
      `
    case 'success':
      return css`
        color: ${Color.neutral100};
        background: ${Color.explorer_buttonSuccess};

        &:hover {
          background: ${Color.explorer_buttonSuccess};
          border-color: ${Color.explorer_buttonSuccess};
        }
      `
    case 'danger':
      return css`
        color: ${Color.neutral100};
        background: ${Color.explorer_buttonDanger};

        &:hover {
          background: ${Color.explorer_buttonDanger};
          border-color: ${Color.explorer_buttonDanger};
        }
      `
    case 'warning':
      return css`
        color: ${Color.neutral100};
        background: ${Color.explorer_buttonWarning};

        &:hover {
          background: ${Color.explorer_buttonWarning};
          border-color: ${Color.explorer_buttonWarning};
        }
      `
    case 'cancel':
      return css`
        color: ${Color.neutral100};
        background: transparent;

        &:hover {
          color: ${Color.explorer_textButtonHover};
          background: ${Color.explorer_bgButtonHover};
        }
      `
    case 'disabled':
      return css`
        color: ${Color.neutral70};
        background: ${Color.explorer_buttonDisabled};
      `
  }
}

const getButtonSizeStyles = (size: ButtonSizeVariations = 'default') => {
  switch (size) {
    case 'small':
      return css`
        font-size: 0.6rem;
        padding: 0.3rem 0.5rem;
      `
    case 'big':
      return css`
        font-size: 1.4rem;
        padding: 0.65rem 1rem;
      `
    default:
      return css``
  }
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

export const Button: React.FC<ButtonBaseProps> = ({ children, ...restProps }) => (
  <ButtonBase {...restProps}>{children}</ButtonBase>
)

export default Button
