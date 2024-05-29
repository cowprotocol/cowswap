import styled, { css } from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import { transparentize } from 'color2k'

export const ContainerCard = styled.div<{
  bgColor?: string
  color?: string
  gap?: number
  gapMobile?: number
  touchFooter?: boolean
  centerContent?: boolean
  padding?: string
}>`
  display: flex;
  flex-flow: row wrap;
  justify-content: ${({ centerContent }) => (centerContent ? 'center' : 'flex-start')};
  gap: ${({ gap }) => gap || 100}px;
  margin: ${({ touchFooter }) => (touchFooter ? '0 0 -65px' : '24px 0')};
  width: 100%;
  padding: ${({ padding }) => padding || '60px'};
  border-radius: 60px;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  position: relative;
  color: ${({ color }) => color || Color.neutral0};

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    padding: 48px 21px;
    gap: ${({ gapMobile }) => gapMobile || 100}px;
  }
`

export const ContainerCardSection = styled.div<{ padding?: string; gap?: number }>`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  color: inherit;
  gap: ${({ gap }) => gap || 42}px;
  padding: ${({ padding }) => padding || '0'};
`

export const ContainerCardSectionTop = styled.div<{ columnWrap?: boolean; padding?: string; maxWidth?: number }>`
  display: flex;
  flex-flow: ${({ columnWrap }) => (columnWrap ? 'column wrap' : 'row wrap')};
  gap: 60px;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  justify-content: space-between;
  align-items: center;
  color: inherit;
  padding: ${({ padding }) => padding || '0'};
  margin: 0 auto;
`

export const ContainerCardSectionTopTitle = styled.h3<{
  fontSize?: number
  fontSizeMobile?: number
  color?: string
  textAlign?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 38}px;
  font-weight: ${Font.weight.bold};
  color: ${({ color }) => color || 'inherit'};
  text-align: ${({ textAlign }) => textAlign || 'left'};
  line-height: 1.2;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 38}px;
  }
`

export const ContainerCardSectionTopDescription = styled.small<{
  fontSize?: number
  fontSizeMobile?: number
  color?: string
  textAlign?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 28}px;
  color: ${({ color }) => color || 'inherit'};
  text-align: ${({ textAlign }) => textAlign || 'left'};
  line-height: 1.5;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 21}px;
  }
`

export const ArticleList = styled.div<{ columns?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 3}, 1fr);
  gap: 64px 32px;
  justify-content: space-between;
  width: 100%;

  ${Media.upToMedium()} {
    grid-template-columns: repeat(${({ columnsMobile }) => columnsMobile || 1}, 1fr);
  }
`

export const ArticleCard = styled.a`
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 20px;
  width: 100%;
  text-decoration: none;

  h4 {
    font-size: 28px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral0};
    margin: 16px 0 8px;
    line-height: 1.2;
  }

  p {
    font-size: 16px;
    color: ${Color.neutral0};
    font-weight: ${Font.weight.medium};
    line-height: 1.5;
  }
`

export const ArticleImage = styled.div<{ color?: string }>`
  width: 100%;
  height: 200px;
  background: ${({ color }) => color || Color.neutral70};
  border-radius: 20px;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`

export const ArticleTitle = styled.h4`
  font-size: 18px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin: 16px 0 8px;
`

export const ArticleDescription = styled.p`
  font-size: 14px;
  color: ${Color.neutral0};
`

export const TopicList = styled.div<{
  columns?: number
  columnsMobile?: number
  maxWidth?: number
  gap?: number
  gapMobile?: number
  margin?: string
}>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 3}, 1fr)`};
  gap: ${({ gap }) => (gap ? `${gap}px` : '32px')};
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  margin: ${({ margin }) => margin || '0 auto'};

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
    gap: ${({ gapMobile }) => (gapMobile ? `${gapMobile}px` : '16px')};
  }
`

interface TopicCardProps {
  bgColor?: string
  textColor?: string
  borderColor?: string
  horizontal?: boolean
  columns?: string
  asProp?: string
  padding?: string
  paddingMobile?: string
  contentAlign?: string
  gap?: number
}

export const TopicCard = styled.a.attrs<TopicCardProps>(({ asProp }) => ({
  as: asProp || 'a',
}))<TopicCardProps>`
  display: ${({ columns }) => (columns ? 'grid' : 'flex')};
  grid-template-columns: ${({ columns }) => columns || '1fr'};
  flex-flow: ${({ horizontal }) => (horizontal ? 'row wrap' : 'column wrap')};
  align-items: ${({ contentAlign }) => (contentAlign === 'left' ? 'flex-start' : 'center')};
  justify-content: flex-start;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  color: ${({ textColor }) => textColor || Color.neutral0};
  padding: ${({ padding }) => padding || '56px 20px'};
  border-radius: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: ${Font.weight.bold};
  text-decoration: none;
  border: ${({ borderColor }) => (borderColor ? `4px solid ${borderColor}` : '4px solid transparent')};
  transition: border 0.2s ease-in-out;
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : '56px')};
  max-width: 100%;

  &:hover {
    border: ${({ asProp }) => (asProp === 'div' ? '4px solid transparent' : `4px solid ${Color.neutral40}`)};
  }

  ${Media.upToMedium()} {
    padding: ${({ paddingMobile }) => paddingMobile || '32px 16px'};
    gap: 32px;
    display: flex;
    flex-flow: column wrap;
  }

  ${({ asProp }) =>
    asProp === 'div' &&
    `
    &:hover {
      border: 4px solid transparent;
    }
  `}
`

export const TopicCardInner = styled.div<{ contentAlign?: string; gap?: number; height?: string }>`
  display: flex;
  flex-flow: column wrap;
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : '16px')};
  text-align: ${({ contentAlign }) => contentAlign || 'center'};
  align-items: ${({ contentAlign }) =>
    contentAlign === 'left' ? 'flex-start' : contentAlign === 'right' ? 'flex-end' : 'center'};
  height: ${({ height }) => height || 'auto'};
`

export const TopicImage = styled.div<{
  iconColor?: string
  large?: boolean
  bgColor?: string
  margin?: string
  height?: number | string
  width?: number | string
  heightMobile?: number | string
  widthMobile?: number | string
  orderReverseMobile?: boolean
}>`
  --size: ${({ large }) => (large ? '290px' : '132px')};
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || 'var(--size)')};
  max-width: 100%;
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || 'var(--size)')};
  border-radius: var(--size);
  background: ${({ bgColor, iconColor }) => bgColor || iconColor || Color.neutral90};
  color: ${({ iconColor }) => iconColor || Color.neutral90};
  margin: ${({ margin }) => margin || '0 0 16px'};

  ${Media.upToMedium()} {
    width: 100%;
    height: ${({ heightMobile, height }) =>
      heightMobile
        ? typeof heightMobile === 'number'
          ? `${heightMobile}px`
          : heightMobile
        : typeof height === 'number'
        ? `${height}px`
        : height || 'var(--size)'};
    order: ${({ orderReverseMobile }) => (orderReverseMobile ? -1 : 'initial')};
    max-width: 100%;
  }

  > span {
    height: inherit;
    width: inherit;
    color: inherit;
    max-width: 100%;
  }

  svg,
  img {
    fill: currentColor;
    height: inherit;
    width: inherit;
    object-fit: contain;
    max-width: 100%;
  }
`

export const TopicTitle = styled.h5<{
  fontSize?: number
  fontSizeMobile?: number
  fontWeight?: number
  color?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 28}px;
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.bold};
  color: ${({ color }) => color || 'inherit'};
  padding: 0;
  margin: 0;
  line-height: 1.2;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 28}px;
    font-weight: ${({ fontWeight }) => fontWeight || Font.weight.bold};
  }
`

export const TopicDescription = styled.p<{
  fontSize?: number
  fontSizeMobile?: number
  fontWeight?: string
  color?: string
  margin?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 16}px;
  color: ${({ color }) => color || 'inherit'};
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.medium};
  line-height: 1.4;
  margin: ${({ margin }) => margin || '16px 0'};
  text-align: inherit;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 16}px;
  }

  > table {
    > tr > td:nth-child(odd) {
      padding: 0 16px 0 0;
    }
  }
`

export const TopicButton = styled.a<{ fontSize?: number; fontSizeMobile?: number; bgColor?: string; color?: string }>`
  display: inline-block;
  padding: 16px 24px;
  font-size: ${({ fontSize }) => fontSize || 21}px;
  font-weight: ${Font.weight.bold};
  color: ${({ color }) => color || Color.neutral98};
  background-color: ${({ bgColor }) => bgColor || Color.neutral10};
  text-decoration: none;
  border-radius: 32px;
  line-height: 1.2;
  text-align: center;
  width: max-content;
  transition: opacity 0.2s ease-in-out;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 16}px;
  }

  &:hover {
    opacity: 0.8;
  }
`

export const LinkSection = styled.div<{ columns?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 2}, 1fr)`};
  background: ${Color.neutral100};
  border-radius: 28px;
  padding: 24px;
  width: 100%;
  gap: 24px;

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
  }
`

export const LinkColumn = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 0;
  width: 100%;

  > h5 {
    font-size: 21px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral0};
    margin: 0 0 16px;
    line-height: 1.2;
  }
`

export const LinkItem = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 18px;
  border-radius: 36px;
  padding: 4px 8px 4px 16px;
  text-decoration: none;
  color: ${Color.neutral50};
  transition: color 0.2s ease-in-out;
  line-height: 1.2;

  &:hover {
    color: ${Color.neutral0};
    background: ${Color.neutral80};

    > span {
      color: ${Color.neutral0};
      background: ${Color.neutral100};
      transform: translateX(3px);
    }
  }

  &:last-child {
    margin-bottom: 0;
  }

  > span {
    --size: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--size);
    width: var(--size);
    color: ${Color.neutral50};
    transition: color 0.2s ease-in-out;
    border-radius: 24px;
    font-size: 24px;
    transition: transform 0.2s ease-in-out;
  }
`

export const CTASectionWrapper = styled.section`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 28px;
  padding: 0 24px;
  background: transparent;
  text-align: center;
  margin: 100px 0;
`

export const CTAImage = styled.div<{ bgColor?: string }>`
  --size: 100px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: ${({ bgColor }) => bgColor || Color.neutral50};
  padding: 0;

  > img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const CTATitle = styled.h6`
  font-size: 48px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin: 0;
  line-height: 1.2;
  white-space: wrap;

  ${Media.upToMedium()} {
    font-size: 38px;
  }
`

export const CTASubtitle = styled.p`
  font-size: 28px;
  color: ${Color.neutral30};
  margin: 0;
  line-height: 1.2;
`

export const CTAButton = styled.a`
  --height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--height);
  padding: 12px 24px;
  font-size: 24px;
  font-weight: ${Font.weight.medium};
  color: ${Color.neutral98};
  background: ${Color.neutral0};
  border: none;
  border-radius: var(--height);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    color: ${Color.neutral100};
    background: ${Color.neutral20};
  }
`

export const Breadcrumbs = styled.div<{ padding?: string }>`
  display: flex;
  justify-content: flex-start;
  font-size: 16px;
  line-height: 1.2;
  padding: ${({ padding }) => padding || '0 0 24px'};
  color: ${Color.neutral50};

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    gap: 8px;
    font-size: 14px;
  }

  > h1 {
    font-size: inherit;
    margin: 0;
    line-height: inherit;
  }

  > a {
    color: ${Color.neutral50};
    text-decoration: none;
    margin-right: 8px;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${Color.neutral0};
    }

    &:after {
      content: '→';
      margin-left: 8px;
    }

    &:last-child:after {
      content: '';
    }
  }

  > span {
    color: ${Color.neutral0};
  }
`

export const ArticleCount = styled.p`
  font-size: 16px;
  color: ${Color.neutral50};
`

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 24px auto 0;
  padding: 4px;
  background: ${Color.neutral100};
  border-radius: 21px;
  width: min-content;

  > a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: inherit;
    text-decoration: none;
    font-size: 16px;
    font-weight: ${Font.weight.medium};
    color: ${Color.neutral100};
    background: transparent;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: ${Color.neutral80};
    }

    &.active {
      background: ${Color.neutral100};
      color: ${Color.neutral100};
    }
  }

  span {
    font-size: 16px;
    color: ${Color.neutral60};
  }
`

export const SectionTitleWrapper = styled.div<{
  color?: string
  maxWidth?: number
  gap?: number
  padding?: string
  paddingMobile?: string
  margin?: string
  marginMobile?: string
  rowWrap?: boolean
}>`
  --color: ${Color.neutral20};
  display: flex;
  flex-flow: column wrap;
  flex-flow: ${({ rowWrap }) => (rowWrap ? 'row wrap' : 'column wrap')};
  align-items: center;
  color: ${({ color }) => color || 'inherit'};
  margin: ${({ margin }) => margin || '100px auto 56px'};
  text-align: center;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  gap: ${({ gap }) => gap || 32}px;
  padding: ${({ padding }) => padding || '0'};

  ${Media.upToMedium()} {
    margin: ${({ marginMobile }) => marginMobile || '56px auto 32px'};
    padding: ${({ paddingMobile }) => paddingMobile || '0'};
  }
`

export const SectionTitleText = styled.h5<{
  fontSize?: number
  fontSizeMobile?: number
  fontWeight?: number
  color?: string
  maxWidth?: number
  as?: string
  textAlign?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 90}px;
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.bold};
  color: ${({ color }) => color || 'inherit'};
  margin: 0;
  text-align: ${({ textAlign }) => textAlign || 'center'};
  line-height: 1.2;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 38}px;
  }
`

export const SectionTitleDescription = styled.p<{
  maxWidth?: number | string
  color?: string
  fontSize?: number
  fontSizeMobile?: number
  textAlign?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 38}px;
  color: ${({ color }) => color || 'inherit'};
  font-weight: ${Font.weight.medium};
  margin: 0;
  line-height: 1.2;
  text-align: ${({ textAlign }) => textAlign || 'center'};
  width: 100%;
  max-width: ${({ maxWidth }) => (typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || '100%')};

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 21}px;
  }
`

export const SectionTitleButton = styled.a<{ bgColor?: string; color?: string; margin?: string }>`
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
  transition: opacity 0.2s ease-in-out;
  max-width: 100%;
  margin: ${({ margin }) => margin || '0'};

  &:hover {
    opacity: 0.8;
  }
`

export const SectionTitleIcon = styled.div<{ size?: number; multiple?: boolean }>`
  --size: ${({ size }) => (size ? `${size}px` : '64px')};
  width: 100%;
  object-fit: contain;
  color: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;

  > span {
    height: var(--size);
    width: ${({ multiple }) => (multiple ? 'auto' : '100%')};
    color: inherit;
  }

  svg {
    width: ${({ multiple }) => (multiple ? 'auto' : '100%')};
    height: 100%;
    max-height: var(--size);
    fill: currentColor;
  }

  .image-reverse {
    transform: scaleX(-1);
  }
`

export const SectionImage = styled.div<{
  width?: number
  minHeight?: number | string
  bgColor?: string
}>`
  width: 100%;
  max-width: ${({ width }) => (width ? `${width}px` : '100%')};
  min-height: ${({ minHeight }) => (typeof minHeight === 'number' ? `${minHeight}px` : minHeight || '600px')};
  margin: 0 auto;
  padding: 0;
  background: ${({ bgColor }) => bgColor || 'transparent'};
  border-radius: 32px;

  ${Media.upToMedium()} {
    min-height: 300px;
    max-width: 100%;
  }

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`

export const HeroContainer = styled.div<{
  variant?: string
  maxWidth?: number
  padding?: string
  paddingMobile?: string
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 60vh;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  background: transparent;
  padding: ${({ padding }) => padding || '0 20px'};
  overflow: hidden;
  margin: 0 auto;

  ${Media.upToMedium()} {
    padding: ${({ paddingMobile }) => paddingMobile || '0 20px'};
  }

  ${({ variant }) =>
    variant === 'secondary' &&
    css`
      flex-flow: row nowrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 74px;

      ${Media.upToMedium()} {
        flex-flow: column wrap;
        gap: 32px;
      }
    `}
`

export const HeroBackground = styled.div<{ imageHeight?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  > img,
  > svg {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }
`

export const HeroContent = styled.div<{ variant?: string; gap?: number }>`
  position: relative;
  z-index: 2;
  text-align: ${({ variant }) => (variant === 'secondary' ? 'left' : 'center')};
  color: ${Color.neutral0};
  gap: ${({ gap }) => gap || 32}px;
  display: flex;
  flex-flow: column wrap;
  max-width: 100%;

  ${({ variant }) =>
    variant === 'secondary' &&
    `
    align-items: flex-start;
  `}
`

export const HeroTitle = styled.h1<{
  fontSize?: number
  fontSizeMobile?: number
  fontWeight?: number
  color?: string
  as?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 150}px;
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.bold};
  color: ${({ color }) => color || Color.neutral10};
  margin: 0;
  line-height: 1.2;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 67}px;
  }
`

export const HeroSubtitle = styled.p<{ variant?: string; color?: string }>`
  --color: ${({ color }) => color || Color.neutral10};
  font-size: 28px;
  font-weight: ${Font.weight.bold};
  background: ${({ variant }) => (variant === 'pill' ? Color.neutral100 : 'transparent')};
  color: var(--color);
  padding: ${({ variant }) => (variant === 'pill' ? '8px 16px' : '0')};
  border-radius: ${({ variant }) => (variant === 'pill' ? '32px' : '0')};
  border-bottom: ${({ variant }) => (variant === 'pill' ? 'none' : `4px solid var(--color)`)};
  width: max-content;
  max-width: 100%;
  margin: ${({ variant }) => (variant === 'pill' ? '0 auto' : '0')};
  line-height: 1.5;

  ${Media.upToMedium()} {
    font-size: 21px;
  }
`

export const HeroDescription = styled.p<{ fontSize?: number; fontSizeMobile?: number; color?: string }>`
  font-size: ${({ fontSize }) => fontSize || 28}px;
  font-weight: ${Font.weight.medium};
  color: ${({ color }) => color || Color.neutral10};
  margin: 16px 0;
  padding: 0;
  line-height: 1.5;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 21}px;
  }

  > ol {
    padding: 0 0 0 24px;
    font-size: inherit;
  }
`

export const HeroButtonWrapper = styled.div<{ gap?: number }>`
  display: flex;
  gap: ${({ gap }) => gap || 56}px;
  margin: 32px 0;
`

export const HeroButton = styled.a<{ background?: string; color?: string }>`
  display: inline-block;
  padding: 16px 24px;
  font-size: 27px;
  font-weight: ${Font.weight.bold};
  color: ${({ color }) => color || Color.neutral98};
  background: ${({ background }) => background || Color.neutral10};
  text-decoration: none;
  border-radius: 32px;
  line-height: 1.2;
  text-align: center;
  width: max-content;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.8;
  }
`

export const HeroImage = styled.div<{
  width?: number
  height?: number
  color?: string
  margin?: string
  marginMobile?: string
}>`
  width: 100%;
  height: ${({ height }) => (height ? `${height}px` : 'auto')};
  max-width: ${({ width }) => `${width}px` || '100%'};
  margin: ${({ margin }) => margin || '0 auto'};
  padding: 0;
  color: ${({ color }) => color || Color.neutral0};

  ${Media.upToMedium()} {
    margin: ${({ marginMobile }) => marginMobile || '0 auto'};
  }

  > img,
  > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const MetricsCard = styled.div<{
  bgColor?: string
  color?: string
  columns?: number
  columnsMobile?: number
  touchFooter?: boolean
}>`
  --paddingBottomOffset: ${({ touchFooter }) => (touchFooter ? '160px' : '60px')};
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 3}, 1fr)`};
  gap: 0;
  width: 100%;
  padding: 60px 60px var(--paddingBottomOffset);
  border-radius: 60px;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  color: ${({ color }) => color || Color.neutral0};
  position: relative;
  margin: ${({ touchFooter }) => (touchFooter ? '0 0 calc(-1 * var(--paddingBottomOffset))' : '24px 0')};

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
    gap: 16px;
  }
`

export const MetricsItem = styled.div<{ dividerColor?: string }>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  text-align: center;
  gap: 8px;

  &:not(:last-child)::after {
    content: '';
    width: 2px;
    height: 100%;
    padding: 0;
    margin: 0 16px;
    background: ${({ dividerColor }) => dividerColor || Color.neutral80};

    ${Media.upToMedium()} {
      width: 100%;
      height: 2px;
      margin: 16px 0;
    }
  }

  > h2 {
    font-size: 48px;
    font-weight: ${Font.weight.bold};
    margin: 0;
    color: inherit;
  }

  > p {
    font-size: 21px;
    font-weight: ${Font.weight.medium};
    line-height: 1.3;
    color: inherit;
    margin: 0;
    max-width: 50%;

    ${Media.upToMedium()} {
      max-width: 100%;
    }
  }
`

export const TrustedBy = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0;
  width: 100%;
  font-size: 3.2rem;
  color: ${Color.neutral0};
  font-weight: ${Font.weight.regular};

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    gap: 1.6rem;
    font-size: 2.6rem;
    text-align: center;
  }

  > ul {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    justify-content: flex-start;
    margin: 0;
    padding: 0;
    height: 5rem;
    width: 34rem;
    overflow: hidden;
    gap: 3rem;
    position: relative;

    ${Media.upToMedium()} {
      width: 100%;
    }
  }

  > ul > li {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    font-size: 2.6rem;
    color: ${Color.neutral0};
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transform: translateY(-100%);
    animation: slide 9s ease 0s infinite normal forwards;
    opacity: 0;
    gap: 1.2rem;

    ${Media.upToMedium()} {
      font-size: 1.8rem;
    }
  }

  > ul > li:nth-child(1) {
    animation-delay: 0s;
  }

  > ul > li:nth-child(2) {
    animation-delay: 3s;
  }

  > ul > li:nth-child(3) {
    animation-delay: 6s;
  }

  > ul > li > svg {
    display: flex;
    height: 100%;
    width: 100%;
    object-fit: contain;

    ${Media.upToMedium()} {
      height: 70%;
      width: auto;
    }

    > g {
      fill: ${Color.neutral0};
    }
  }

  > ul > li > strong {
    font-weight: ${Font.weight.bold};
    white-space: nowrap;
    color: ${Color.neutral0};
  }

  @keyframes slide {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    10% {
      transform: translateY(0%);
      opacity: 1;
    }
    30% {
      transform: translateY(0%);
      opacity: 1;
    }
    40% {
      transform: translateY(100%);
      opacity: 0;
    }
    100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }
`

// From legacy cow.fi
export const SwiperSlideWrapper = styled.div`
  --swiper-navigation-color: ${Color.neutral0};
  --swiper-theme-color: ${Color.neutral0};
  --swiper-pagination-bullet-inactive-color: ${Color.neutral100};
  --swiper-pagination-color: ${Color.neutral100};
  --swiper-pagination-bullet-size: 1.2rem;

  display: flex;
  flex-flow: column wrap;
  width: 100%;
  overflow: hidden;
  position: relative;

  .daoSwiper {
    position: relative;
    padding: 0 0 5rem; // Fix for swiper pagination

    ${Media.upToMedium()} {
      overflow-x: visible;
    }

    &::before,
    &::after {
      content: '';
      height: 100%;
      width: 16rem;
      position: absolute;
      left: 0;
      top: 0;
      background: linear-gradient(90deg, ${Color.neutral10}, ${transparentize('white', 1)} 100%);
      z-index: 10;

      ${Media.upToMedium()} {
        display: none;
        content: none;
      }
    }

    &::after {
      background: linear-gradient(270deg, ${Color.neutral10}, ${transparentize('white', 1)} 100%);
      left: initial;
      right: 0;
    }
  }

  .daoSwiper {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    max-width: 100%;
  }

  .daoSwiper > .swiper-wrapper {
    max-width: 80%;
    align-items: flex-start;
    justify-content: flex-start;

    ${Media.upToMedium()} {
      max-width: 100%;
      align-items: stretch;
    }
  }

  .daoSwiper > .swiper-wrapper > .swiper-slide {
    height: 49rem;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    border-radius: 6rem;
    border: 0.1rem solid grey;
    color: ${Color.neutral70};
    font-size: 2.4rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;

    ${Media.upToMedium()} {
      height: auto;
      max-width: 95%;
      display: flex;
      flex-flow: column wrap;
    }

    > img {
      max-width: 100%;
      height: 100%;
      object-fit: cover;

      ${Media.upToMedium()} {
        height: 12rem;
        width: 100%;
        margin: 0 auto 2.4rem;
      }
    }

    > span {
      display: flex;
      flex-flow: column wrap;
      padding: 5.6rem;
      gap: 2.4rem;

      ${Media.upToMedium()} {
        padding: 0 3.2rem 4.6rem;
      }
    }

    > span > h4 {
      margin: 0;
      font-size: 3.4rem;
      line-height: 1.2;
      color: ${Color.neutral100};
      font-weight: ${Font.weight.bold};

      ${Media.upToMedium()} {
        font-size: 2.4rem;
      }
    }

    > span > p {
      font-size: 1.8rem;
      line-height: 1.4;

      ${Media.upToMedium()} {
        font-size: 1.6rem;
      }
    }
  }

  .swiper-button-next {
    z-index: 20;
    color: ${Color.neutral100};

    ${Media.upToMedium()} {
      left: initial;
      right: 5px;
    }
  }

  .swiper-button-prev {
    z-index: 20;
    color: ${Color.neutral100};

    ${Media.upToMedium()} {
      left: 5px;
      right: initial;
    }
  }
`

export const WidgetContainer = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1.6rem;

  &::before {
    color: ${Color.neutral0};
    font-size: 2.1rem;
    font-weight: ${Font.weight.bold};
    content: 'Try it out!';
    background: url('/images/arrow-drawn.svg') no-repeat center 2.5rem / 2.4rem 5rem;
    width: 12rem;
    height: 7.5rem;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    transform: rotateZ(-15deg);
  }

  ${Media.upToMedium()} {
    > iframe {
      width: 100%;
    }
  }
`
