import styled, { css } from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'

export const ContainerCard = styled.div<{
  bgColor?: string
  color?: string
  gap?: number
  gapMobile?: number
  touchFooter?: boolean
  centerContent?: boolean
}>`
  display: flex;
  flex-flow: row wrap;
  justify-content: ${({ centerContent }) => (centerContent ? 'center' : 'flex-start')};
  gap: ${({ gap }) => gap || 100}px;
  margin: ${({ touchFooter }) => (touchFooter ? '0 0 -65px' : '24px 0')};
  width: 100%;
  padding: 60px;
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

export const ContainerCardSection = styled.div<{ padding?: string }>`
  display: flex;
  flex-flow: row wrap;
  gap: 42px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  color: inherit;
  padding: ${({ padding }) => padding || '0'};
`

export const ContainerCardSectionTop = styled.div<{ columnWrap?: boolean; padding?: string }>`
  display: flex;
  flex-flow: ${({ columnWrap }) => (columnWrap ? 'column wrap' : 'row wrap')};
  gap: 60px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  color: inherit;
  padding: ${({ padding }) => padding || '0'};
`

// create a containercardsection top title component and a description one that replaces the h1 and h3 and small and allow for passing fontSize and color
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

export const TopicList = styled.div<{ columns?: number; columnsMobile?: number; maxWidth?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 3}, 1fr)`};
  gap: 32px;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  margin: 0 auto;

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
    gap: 16px;
  }
`

interface TopicCardProps {
  bgColor?: string
  textColor?: string
  horizontal?: boolean
  columns?: string
  asProp?: string
  padding?: string
  contentAlign?: string
}

export const TopicCard = styled.a.attrs<TopicCardProps>(({ asProp }) => ({
  as: asProp || 'a',
}))<TopicCardProps>`
  display: ${({ columns }) => (columns ? 'grid' : 'flex')};
  grid-template-columns: ${({ columns }) => columns || '1fr'};
  flex-flow: ${({ horizontal }) => (horizontal ? 'row wrap' : 'column wrap')};
  align-items: ${({ contentAlign }) => (contentAlign === 'left' ? 'flex-start' : 'center')};
  justify-content: center;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  color: ${({ textColor }) => textColor || Color.neutral0};
  padding: ${({ padding }) => padding || '56px 20px'};
  border-radius: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: ${Font.weight.bold};
  text-decoration: none;
  border: 4px solid transparent;
  transition: border 0.2s ease-in-out;
  gap: 56px;
  max-width: 100%;

  &:hover {
    border: ${({ asProp }) => (asProp === 'div' ? '4px solid transparent' : `4px solid ${Color.neutral40}`)};
  }

  ${Media.upToMedium()} {
    padding: 32px 16px;
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

export const TopicCardInner = styled.div<{ contentAlign?: string }>`
  display: flex;
  flex-flow: column wrap;
  gap: 16px;
  text-align: ${({ contentAlign }) => contentAlign || 'center'};
  align-items: ${({ contentAlign }) =>
    contentAlign === 'left' ? 'flex-start' : contentAlign === 'right' ? 'flex-end' : 'center'};
`

export const TopicImage = styled.div<{
  iconColor: string
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
    width: ${({ widthMobile }) =>
      typeof widthMobile === 'number' ? `${widthMobile}px` : widthMobile || 'var(--size)'};
    height: ${({ heightMobile }) =>
      typeof heightMobile === 'number' ? `${heightMobile}px` : heightMobile || 'var(--size)'};
    order: ${({ orderReverseMobile }) => (orderReverseMobile ? -1 : 'initial')};
  }

  > span {
    height: inherit;
    width: inherit;
    color: inherit;
  }

  svg {
    fill: currentColor;
  }
`

export const TopicTitle = styled.h5<{ fontSize?: number; fontSizeMobile?: number; fontWeight?: number }>`
  font-size: ${({ fontSize }) => fontSize || 28}px;
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.medium};
  color: inherit;
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
}>`
  font-size: ${({ fontSize }) => fontSize || 16}px;
  color: ${({ color }) => color || Color.neutral50};
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.medium};
  line-height: 1.4;
  margin: 16px 0;
  text-align: inherit;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 16}px;
  }
`

export const TopicButton = styled.a<{ fontSize?: number; fontSizeMobile?: number; bgColor?: string; color?: string }>`
  display: inline-block;
  padding: 16px 24px;
  font-size: ${({ fontSize }) => fontSize || 21}px;
  font-weight: ${Font.weight.medium};
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
    color: ${Color.neutral0};
    background: transparent;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: ${Color.neutral80};
    }

    &.active {
      background: ${Color.neutral0};
      color: ${Color.neutral100};
    }
  }

  span {
    font-size: 16px;
    color: ${Color.neutral60};
  }
`

export const SectionTitleWrapper = styled.div<{ color?: string; maxWidth?: number }>`
  --color: ${Color.neutral20};
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  color: ${({ color }) => color || Color.neutral20};
  margin: 100px auto 56px;
  text-align: center;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  gap: 32px;
`

export const SectionTitleText = styled.h5`
  font-size: 90px;
  font-weight: ${Font.weight.bold};
  color: inherit;
  line-height: 1.2;
  margin: 0;

  ${Media.upToMedium()} {
    font-size: 38px;
  }
`

export const SectionTitleDescription = styled.p<{ maxWidth?: number; color?: string }>`
  font-size: 38px;
  color: ${({ color }) => color || Color.neutral50};
  font-weight: ${Font.weight.medium};
  margin: 0;
  line-height: 1.2;
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth || 800}px;

  ${Media.upToMedium()} {
    font-size: 21px;
  }
`

export const SectionTitleIcon = styled.div<{ size?: number }>`
  --size: ${({ size }) => `${size}px` || '64px'};
  width: 100%;
  object-fit: contain;
  color: inherit;

  > svg {
    width: 100%;
    height: 100%;
    max-height: var(--size);
    fill: currentColor;
  }
`

export const HeroContainer = styled.div<{ variant?: string; maxWidth?: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 60vh;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  background: transparent;
  padding: 0 20px;
  overflow: hidden;
  margin: 0 auto;

  ${({ variant }) =>
    variant === 'secondary' &&
    css`
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 74px;
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

export const HeroContent = styled.div<{ variant?: string }>`
  position: relative;
  z-index: 2;
  text-align: ${({ variant }) => (variant === 'secondary' ? 'left' : 'center')};
  color: ${Color.neutral0};
  gap: 32px;
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

export const HeroDescription = styled.p<{ fontSize?: number; fontSizeMobile?: number }>`
  font-size: ${({ fontSize }) => fontSize || 28}px;
  font-weight: ${Font.weight.medium};
  color: ${Color.neutral10};
  margin: 16px 0;
  line-height: 1.5;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 21}px;
  }
`

export const HeroButton = styled.a<{ background?: string; color?: string }>`
  display: inline-block;
  padding: 16px 24px;
  font-size: 27px;
  font-weight: ${Font.weight.medium};
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

export const HeroImage = styled.div<{ width?: number }>`
  width: 100%;
  height: 100%;
  max-width: ${({ width }) => `${width}px` || '100%'};
  margin: 0 auto;
  padding: 0;

  ${Media.upToMedium()} {
  }
`

export const MetricsCard = styled.div<{
  bgColor?: string
  color?: string
  columns?: number
  columnsMobile?: number
  touchFooter?: boolean
}>`
  --paddingBottomOffset: ${({ touchFooter }) => (touchFooter ? '140px' : '60px')};
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
