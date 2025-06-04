import { FC, ReactNode } from 'react'

import { Font, Color, Media } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import NextLink from 'next/link'
import styled, { css } from 'styled-components/macro'

import { defaultUtm } from 'modules/utm'

export enum LinkType {
  TopicButton = 'topicButton',
  HeroButton = 'heroButton',
  SectionTitleButton = 'sectionTitleButton',
}

interface LinkProps extends Omit<React.HTMLAttributes<HTMLAnchorElement & HTMLDivElement>, 'href' | 'ref'> {
  href?: string
  external?: boolean
  linkType?: LinkType
  children: ReactNode
  fontSize?: number
  fontSizeMobile?: number
  bgColor?: string
  color?: string
  disabled?: boolean
  padding?: string
  margin?: string
  marginTablet?: string
  marginMobile?: string
  utmContent?: string
  gridFullWidth?: boolean
  asButton?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement & HTMLDivElement>
}

const baseStyles = css`
  max-width: 100%;
`

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
  text-decoration: none;

  ${Media.upToLarge()} {
    margin: ${({ marginTablet }) => marginTablet || 'initial'};
  }

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 16}px;
    margin: ${({ marginMobile }) => marginMobile || 'initial'};
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
  ${({ linkType }) => linkType === LinkType.TopicButton && topicButtonStyles}
  ${({ linkType }) => linkType === LinkType.HeroButton && heroButtonStyles}
  ${({ linkType }) => linkType === LinkType.SectionTitleButton && sectionTitleButtonStyles}
`

const StyledDiv = styled.div<LinkProps>`
  ${baseStyles}
  ${({ linkType }) => linkType === LinkType.TopicButton && topicButtonStyles}
  ${({ linkType }) => linkType === LinkType.HeroButton && heroButtonStyles}
  ${({ linkType }) => linkType === LinkType.SectionTitleButton && sectionTitleButtonStyles}
`

export const Link: FC<LinkProps> = ({ href, external, linkType, children, utmContent, asButton, ...rest }) => {
  const finalHref = external
    ? `${href}?utm_source=${defaultUtm.utmSource}&utm_medium=${defaultUtm.utmMedium}&utm_content=${
        utmContent || defaultUtm.utmContent
      }`
    : href

  if (asButton) {
    return (
      <StyledDiv linkType={linkType} {...rest}>
        {children}
      </StyledDiv>
    )
  }

  if (external) {
    return (
      <StyledAnchor target="_blank" rel="noopener noreferrer" href={finalHref} linkType={linkType} {...rest}>
        {children}
      </StyledAnchor>
    )
  }

  return (
    <NextLink href={finalHref || '#'} passHref legacyBehavior>
      <StyledAnchor linkType={linkType} {...rest}>
        {children}
      </StyledAnchor>
    </NextLink>
  )
}
