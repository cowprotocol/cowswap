import styled, { css } from 'styled-components'
import { Defaults, Color, Font, Media } from 'styles/variables'
import React, { forwardRef } from 'react'
import { lighten } from 'polished'

export enum ButtonVariant {
  OUTLINE = 'outline',
  SMALL = 'small',
  TEXT = 'text',
  TEXT_LIGHT = 'textLight',
  LIGHT = 'light',
  OUTLINE_LIGHT = 'outlineLight',
  COWAMM_LIGHTBLUE = 'cowammLightBlue',
  COWAMM_OUTLINE_LIGHT = 'cowammOutlineLight',
  COWAMM_OUTLINE_SMALL = 'cowammOutlineSmall',
}

type ButtonProps = {
  wrapText?: boolean
  borderRadius?: number
  fontSize?: number
  fontSizeMobile?: number
  fontWeight?: number
  paddingLR?: number
  paddingTB?: number
  paddingMobileLR?: number
  paddingMobileTB?: number
  marginTB?: number
  variant?: ButtonVariant
  href?: string
  label: string
  target?: string
  rel?: string
  minHeight?: number
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}

const Wrapper = styled.a<Omit<ButtonProps, 'href' | 'label' | 'target' | 'rel'>>`
  display: flex;
  background: ${Color.darkBlue};
  flex-flow: row;
  border: 0.1rem solid transparent;
  color: ${Color.lightBlue};
  padding-top: ${({ paddingTB }) => (paddingTB ? `${paddingTB}rem` : '0')};
  padding-bottom: ${({ paddingTB }) => (paddingTB ? `${paddingTB}rem` : '0')};
  padding-left: ${({ paddingLR }) => (paddingLR ? `${paddingLR}rem` : '2.4rem')};
  padding-right: ${({ paddingLR }) => (paddingLR ? `${paddingLR}rem` : '2.4rem')};
  margin: ${({ marginTB }) => (marginTB ? `${marginTB}rem 0` : '0')};
  box-sizing: border-box;
  border-radius: ${({ borderRadius }) => `${borderRadius ?? Defaults.borderRadius}`};
  min-height: ${({ minHeight }) => (minHeight ? `${minHeight}rem` : '5.6rem')};
  align-items: center;
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}rem` : '2.2rem')};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : Font.weightMedium)};
  justify-content: center;
  transition: color 0.2s ease-in-out, background 0.2s ease-in-out;
  white-space: ${({ wrapText }) => (wrapText ? 'initial' : 'nowrap')};
  text-decoration: none;

  ${Media.mobile} {
    max-width: 100%;
    white-space: pre-wrap;
    line-height: 1.1;
    text-align: center;
    padding-left: ${({ paddingMobileLR }) => (paddingMobileLR ? `${paddingMobileLR}rem` : '1.6rem')};
    padding-right: ${({ paddingMobileLR }) => (paddingMobileLR ? `${paddingMobileLR}rem` : '1.6rem')};
    padding-top: ${({ paddingMobileTB }) => (paddingMobileTB ? `${paddingMobileTB}rem` : '0')};
    padding-bottom: ${({ paddingMobileTB }) => (paddingMobileTB ? `${paddingMobileTB}rem` : '0')};
    min-height: 4.8rem;
    font-size: ${({ fontSizeMobile }) => (fontSizeMobile ? `${fontSizeMobile}rem` : '1.6rem')};
  }

  &:hover {
    background: ${({ variant }) => (variant === ButtonVariant.OUTLINE ? Color.darkBlue : Color.text1)};
    color: ${Color.lightBlue};
  }

  ${({ variant }) =>
    variant === ButtonVariant.OUTLINE &&
    css`
      background: transparent;
      border: 0.1rem solid ${Color.darkBlue};
      color: ${Color.darkBlue};
    `}

  ${({ variant, borderRadius }) =>
    variant === ButtonVariant.SMALL &&
    css`
      min-height: 3.6rem;
      border-radius: ${borderRadius ? borderRadius : '1.2rem'};
    `}

  ${({ variant }) =>
    variant === ButtonVariant.TEXT &&
    css`
    background: transparent;
    color: ${Color.darkBlue};

    &:hover {
      background: transparent;
      color: ${Color.darkBlue};
      text-decoration: underline;
  `}

  ${({ variant }) =>
    variant === ButtonVariant.TEXT_LIGHT &&
    css`
      background: transparent;
      color: ${Color.lightBlue};
    `}

  ${({ variant }) =>
    variant === ButtonVariant.LIGHT &&
    css`
      background: ${Color.lightBlue};
      color: ${Color.darkBlue};
    `}

  ${({ variant }) =>
    variant === ButtonVariant.OUTLINE_LIGHT &&
    css`
      background: transparent;
      border: 0.1rem solid ${Color.lightBlue};
    `}

${({ variant }) =>
    variant === ButtonVariant.COWAMM_LIGHTBLUE &&
    css`
      background: ${Color.cowammLightBlue};
      color: ${Color.cowammBlack};

      &:hover {
        background: ${lighten(0.2, Color.cowammLightBlue)};
        color: ${Color.cowammBlack};
      }
    `}

${({ variant }) =>
    variant === ButtonVariant.COWAMM_OUTLINE_LIGHT &&
    css`
      background: transparent;
      color: ${Color.cowammWhite};
      border: 0.1rem solid ${Color.cowammWhite};

      &:hover {
        background: ${Color.cowammWhite};
        color: ${Color.cowammBlack};
      }
    `}

${({ variant }) =>
    variant === ButtonVariant.COWAMM_OUTLINE_SMALL &&
    css`
      min-height: 3.6rem;
      background: transparent;
      color: ${Color.cowammWhite};
      border: 0.1rem solid ${Color.cowammWhite};

      &:hover {
        background: ${Color.cowammWhite};
        color: ${Color.cowammBlack};
      }
    `}
`

// General purpose multiple button wrapper
export const ButtonWrapper = styled.div<{ center?: boolean }>`
  display: flex;
  gap: 1.6rem;
  width: 100%;

  ${({ center }) =>
    center &&
    `
    justify-content: center;
    align-items: center;
  `}

  ${Media.mediumDown} {
    flex-flow: column wrap;
    justify-content: center;

    > ${Wrapper} {
      width: 100%;
    }
  }
`

export const Button = forwardRef<HTMLAnchorElement, ButtonProps>(
  (
    {
      wrapText,
      borderRadius,
      fontSize,
      fontSizeMobile,
      fontWeight,
      paddingLR,
      paddingTB,
      paddingMobileLR,
      paddingMobileTB,
      marginTB,
      variant,
      href = '#',
      label,
      target,
      rel,
      minHeight,
      onClick,
    },
    ref
  ) => {
    return (
      <Wrapper
        {...{
          wrapText,
          borderRadius,
          fontSize,
          fontSizeMobile,
          fontWeight,
          paddingLR,
          paddingTB,
          paddingMobileLR,
          paddingMobileTB,
          marginTB,
          variant,
          minHeight,
        }}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        ref={ref}
      >
        {label}
      </Wrapper>
    )
  }
)

Button.displayName = 'Button'
