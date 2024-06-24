import styled, { css } from 'styled-components/macro'
import { Color, Media, Font } from '@cowprotocol/ui'
import React, { forwardRef } from 'react'

export enum ButtonVariant {
  OUTLINE = 'outline',
  SMALL = 'small',
  TEXT = 'text',
  TEXT_LIGHT = 'textLight',
  LIGHT = 'light',
  OUTLINE_LIGHT = 'outlineLight',
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

const Wrapper = styled.span<Omit<ButtonProps, 'href' | 'label' | 'target' | 'rel'>>`
  display: flex;
  background: ${Color.neutral0};
  flex-flow: row;
  border: 0.1rem solid transparent;
  color: ${Color.neutral100};
  padding-top: ${({ paddingTB }) => (paddingTB ? `${paddingTB}rem` : '0')};
  padding-bottom: ${({ paddingTB }) => (paddingTB ? `${paddingTB}rem` : '0')};
  padding-left: ${({ paddingLR }) => (paddingLR ? `${paddingLR}rem` : '2.4rem')};
  padding-right: ${({ paddingLR }) => (paddingLR ? `${paddingLR}rem` : '2.4rem')};
  margin: ${({ marginTB }) => (marginTB ? `${marginTB}rem 0` : '0')};
  box-sizing: border-box;
  border-radius: ${({ borderRadius }) => `${borderRadius ?? '1.6rem'}`};
  min-height: ${({ minHeight }) => (minHeight ? `${minHeight}rem` : '5.6rem')};
  align-items: center;
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}rem` : '2.2rem')};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : Font.weight.bold)};
  justify-content: center;
  transition: color 0.2s ease-in-out, background 0.2s ease-in-out;
  white-space: ${({ wrapText }) => (wrapText ? 'initial' : 'nowrap')};
  text-decoration: none;

  ${Media.upToMedium()} {
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
    background: ${({ variant }) => (variant === ButtonVariant.OUTLINE ? Color.neutral0 : Color.neutral0)};
    color: ${Color.neutral100}!important;
  }

  ${({ variant }) =>
    variant === ButtonVariant.OUTLINE &&
    css`
      background: transparent;
      border: 0.1rem solid ${Color.neutral0};
      color: ${Color.neutral0};
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
    color: ${Color.neutral0}!important;

    &:hover {
      background: transparent;
      color: ${Color.neutral0}!important;
      text-decoration: underline;
  `}

  ${({ variant }) =>
    variant === ButtonVariant.TEXT_LIGHT &&
    css`
      background: transparent;
      color: ${Color.neutral100};
    `}

  ${({ variant }) =>
    variant === ButtonVariant.LIGHT &&
    css`
      background: ${Color.neutral100};
      color: ${Color.neutral0}!important;
    `}

  ${({ variant }) =>
    variant === ButtonVariant.OUTLINE_LIGHT &&
    css`
      background: transparent;
      border: 0.1rem solid ${Color.neutral100};
    `}
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
      href,
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
        as={href ? 'a' : 'span'}
        className={href ? '' : 'blank-button'}
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
