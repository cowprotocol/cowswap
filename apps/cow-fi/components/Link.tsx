import styled, { css } from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import { transparentize } from 'color2k'
import { defaultUtm } from 'modules/utm'
import { AnchorHTMLAttributes, FC, ReactNode } from 'react'
import NextLink from 'next/link'

export enum LinkType {
  TopicButton = 'topicButton',
  HeroButton = 'heroButton',
  SectionTitleButton = 'sectionTitleButton',
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  external?: boolean
  type?: LinkType
  children: ReactNode
  fontSize?: number
  fontSizeMobile?: number
  bgColor?: string
  color?: string
  disabled?: boolean
  padding?: string
  margin?: string
  utmContent?: string
  gridFullWidth?: boolean
}

const baseStyles = css``

const topicButtonStyles = css<LinkProps>`
  display: inline-block;
  padding: ${({ padding }) => padding || '16px 24px'};
  margin: ${({ margin }) => margin || 'initial'};
  font-size: ${({ fontSize }) => fontSize || 21}px;
  font-weight: ${Font.weight.bold};
  color: ${({ color, disabled }) => (disabled ? transparentize(Color.neutral10, 0.5) : color || Color.neutral98)};
  background-color: ${({ bgColor, disabled }) =>
    disabled ? transparentize(Color.neutral10, 0.5) : bgColor || Color.neutral10};
  border-radius: 32px;
  line-height: 1.2;
  text-align: center;
  width: max-content;
  transition: opacity 0.2s ease-in-out;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 16}px;
  }

  &:hover {
    opacity: ${({ disabled }) => (disabled ? 1 : 0.8)};
    text-decoration: none;
  }
`

const heroButtonStyles = css<LinkProps>`
  display: inline-block;
  padding: 16px 24px;
  font-size: 27px;
  font-weight: ${Font.weight.bold};
  color: ${({ color }) => color || Color.neutral98};
  background: ${({ bgColor }) => bgColor || Color.neutral10};
  text-decoration: none;
  border-radius: 32px;
  line-height: 1.2;
  text-align: center;
  width: max-content;
  max-width: 100%;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.8;
  }
`

const sectionTitleButtonStyles = css<LinkProps>`
  display: inline-block;
  padding: 16px 24px;
  font-size: ${({ fontSize }) => (fontSize && `${fontSize}px`) || '24px'};
  font-weight: ${Font.weight.bold};
  color: ${({ color }) => color || Color.neutral98};
  background: ${({ bgColor }) => bgColor || Color.neutral10};
  text-decoration: none;
  border-radius: 32px;
  line-height: 1.2;
  text-align: center;
  width: auto;
  transition: opacity 0.2s ease-in-out;
  max-width: 100%;
  margin: ${({ margin }) => margin || '0'};
  grid-column: ${({ gridFullWidth }) => (gridFullWidth ? '1 / -1' : 'initial')};
  cursor: pointer;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 21}px;
  }

  &:hover {
    opacity: 0.8;
  }
`

const StyledAnchor = styled.a<LinkProps>`
  ${baseStyles}
  ${({ type }) => type === LinkType.TopicButton && topicButtonStyles}
  ${({ type }) => type === LinkType.HeroButton && heroButtonStyles}
  ${({ type }) => type === LinkType.SectionTitleButton && sectionTitleButtonStyles}
`

export const Link: FC<LinkProps> = ({ href, external, type, children, utmContent, ...rest }) => {
  const finalHref = external
    ? `${href}?utm_source=${defaultUtm.utmSource}&utm_medium=${defaultUtm.utmMedium}&utm_content=${
        utmContent || defaultUtm.utmContent
      }`
    : href

  if (external) {
    return (
      <StyledAnchor href={finalHref} type={type} {...rest}>
        {children}
      </StyledAnchor>
    )
  }

  return (
    <NextLink href={finalHref} passHref>
      <StyledAnchor as="a" href={finalHref} type={type} {...rest}>
        {children}
      </StyledAnchor>
    </NextLink>
  )
}
