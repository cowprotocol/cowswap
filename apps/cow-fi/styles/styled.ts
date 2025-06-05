import { Font, Color, Media } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled, { css } from 'styled-components/macro'

import { PAGE_MAX_WIDTH } from '@/components/Layout/const'

export const PageWrapper = styled.div<{ margin?: string }>`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: ${PAGE_MAX_WIDTH}px;
  width: 100%;
  margin: ${({ margin }) => margin || '0 auto'};
  gap: 2.4rem;
`

export const ContainerCard = styled.div<{
  bgColor?: string
  color?: string
  gap?: number
  gapMobile?: number
  touchFooter?: boolean
  centerContent?: boolean
  alignContent?: string
  padding?: string
  minHeight?: string
  margin?: string
  marginMobile?: string
}>`
  display: flex;
  flex-flow: row wrap;
  justify-content: ${({ centerContent }) => (centerContent ? 'center' : 'flex-start')};
  align-content: ${({ alignContent }) => alignContent || 'initial'};
  gap: ${({ gap }) => gap || 100}px;
  margin: ${({ touchFooter, margin }) => (touchFooter ? '0 0 -6.5rem' : margin || '2.4rem 0')};
  width: 100%;
  padding: ${({ padding }) => padding || '6rem'};
  border-radius: 6rem;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  position: relative;
  color: ${({ color }) => color || Color.neutral10};
  min-height: ${({ minHeight }) => minHeight || 'initial'};

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    padding: 4.8rem 2.1rem;
    gap: ${({ gapMobile }) => gapMobile || 100}px;
    margin: ${({ marginMobile, touchFooter, margin }) =>
      marginMobile ? marginMobile : touchFooter ? '0 0 -6.5rem' : margin || '2.4rem 0'};
  }
`

export const ContainerCardInner = styled.div<{ maxWidth?: number; gap?: number; gapMobile?: number }>`
  display: flex;
  flex-flow: column wrap;
  gap: ${({ gap }) => gap || 90}px;
  margin: 0 auto;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};

  ${Media.upToMedium()} {
    gap: ${({ gapMobile }) => gapMobile || 74}px;
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

export const ContainerCardSectionTop = styled.div<{
  columnWrap?: boolean
  padding?: string
  maxWidth?: number
  alignMobile?: string
}>`
  display: flex;
  flex-flow: ${({ columnWrap }) => (columnWrap ? 'column wrap' : 'row wrap')};
  gap: 6rem;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  justify-content: space-between;
  align-items: center;
  color: inherit;
  padding: ${({ padding }) => padding || '0'};
  margin: 0 auto;

  ${Media.upToMedium()} {
    justify-content: ${({ alignMobile }) => alignMobile || 'space-between'};
  }
`

export const ContainerCardSectionTopTitle = styled.h3<{
  fontSize?: number
  fontSizeMobile?: number
  color?: string
  textAlign?: string
  textAlignMobile?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 38}px;
  font-weight: ${Font.weight.bold};
  color: ${({ color }) => color || 'inherit'};
  text-align: ${({ textAlign }) => textAlign || 'left'};
  line-height: 1.2;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 38}px;
    text-align: ${({ textAlignMobile }) => textAlignMobile || 'center'};
    width: 100%;
  }
`

export const ArticleList = styled.div<{ columns?: number; columnsTablet?: number; columnsMobile?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 3}, 1fr);
  gap: 6.4rem 3.2rem;
  justify-content: space-between;
  width: 100%;

  ${Media.upToLarge()} {
    grid-template-columns: repeat(${({ columnsTablet }) => columnsTablet || 3}, 1fr);
  }

  ${Media.upToMedium()} {
    grid-template-columns: repeat(${({ columnsMobile }) => columnsMobile || 1}, 1fr);
  }
`

export const ArticleCard = styled.a`
  display: flex;
  flex-direction: column;
  padding: 1.2rem;
  border-radius: 2rem;
  width: 100%;
  text-decoration: none;
  background: transparent;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: ${Color.neutral98};
  }
`

export const ArticleImage = styled.div<{ color?: string }>`
  width: 100%;
  height: 20rem;
  background: ${({ color }) => color || Color.neutral70};
  border-radius: 2rem;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`

export const ArticleTitle = styled.h4<{ fontSize?: number; fontSizeMobile?: number }>`
  font-size: ${({ fontSize }) => fontSize || 28}px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin: 1.6rem 0 0.8rem;
  line-height: 1.2;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 21}px;
  }
`

export const ArticleDescription = styled.p<{ color?: string; fontSize?: number; fontWeight?: number }>`
  font-size: ${({ fontSize }) => fontSize || 16}px;
  color: ${({ color }) => color || Color.neutral50};
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.medium};
  line-height: 1.5;
`

export const TopicList = styled.div<{
  columns?: number
  columnsTablet?: number
  columnsMobile?: number
  maxWidth?: number
  gap?: number
  gapTablet?: number
  gapMobile?: number
  margin?: string
}>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 3}, 1fr)`};
  gap: ${({ gap }) => (gap ? `${gap}px` : '3.2rem')};
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  margin: ${({ margin }) => margin || '0 auto'};
  overflow-x: auto;

  ${Media.upToLarge()} {
    grid-template-columns: ${({ columnsTablet }) => `repeat(${columnsTablet || 3}, 1fr)`};
    gap: ${({ gapTablet }) => (gapTablet ? `${gapTablet}px` : '3.2rem')};
  }

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
    gap: ${({ gapMobile }) => (gapMobile ? `${gapMobile}px` : '1.6rem')};
  }
`

interface TopicCardProps {
  bgColor?: string
  textColor?: string
  borderColor?: string
  horizontal?: boolean
  columns?: string
  columnsTablet?: string
  columnsMobile?: string
  asProp?: string
  padding?: string
  paddingMobile?: string
  contentAlign?: string
  gap?: number
  height?: string
  fullWidth?: boolean
  border?: string
}

export const TopicCard = styled.a.attrs<TopicCardProps>(({ asProp }) => ({
  as: asProp || 'a',
}))<TopicCardProps>`
  display: ${({ columns, fullWidth }) => (fullWidth ? 'block' : columns ? 'grid' : 'flex')};
  grid-template-columns: ${({ columns, fullWidth }) => (fullWidth ? '1fr' : columns || '1fr')};
  flex-flow: ${({ horizontal, fullWidth }) => (fullWidth ? 'column nowrap' : horizontal ? 'row wrap' : 'column wrap')};
  align-items: ${({ contentAlign }) => (contentAlign === 'left' ? 'flex-start' : 'center')};
  justify-content: flex-start;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  color: ${({ textColor }) => textColor || Color.neutral0};
  padding: ${({ padding }) => padding || '5.6rem 2rem'};
  border-radius: 2rem;
  text-align: center;
  font-size: 2.4rem;
  font-weight: ${Font.weight.bold};
  text-decoration: none;
  border: ${({ border, borderColor }) =>
    border || (borderColor ? `0.4rem solid ${borderColor}` : '0.4rem solid transparent')};
  transition: border 0.2s ease-in-out;
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : '5.6rem')};
  max-width: 100%;
  height: ${({ height }) => height || 'initial'};
  grid-column: ${({ fullWidth }) => (fullWidth ? '1 / -1' : 'auto')}; /* New line for full width */
  position: relative;
  overflow: hidden;

  &:hover {
    border: ${({ asProp, border }) =>
      asProp === 'div' ? border || '0.4rem solid transparent' : `0.4rem solid ${Color.neutral40}`};
  }

  ${Media.upToLarge()} {
    grid-template-columns: ${({ columns, fullWidth, columnsTablet }) =>
      fullWidth ? '1fr' : columnsTablet || columns || '1fr'};
  }

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columns, fullWidth, columnsMobile }) =>
      fullWidth ? '1fr' : columnsMobile || columns || '1fr'};
    padding: ${({ paddingMobile }) => paddingMobile || '3.2rem 1.6rem'};
    gap: 3.2rem;
    display: ${({ fullWidth }) => (fullWidth ? 'block' : 'flex')};
    flex-flow: column wrap;
  }
`

export const TopicCardInner = styled.div<{
  contentAlign?: string
  contentAlignTablet?: string
  contentAlignMobile?: string
  gap?: number
  height?: string
  minHeight?: string
}>`
  display: flex;
  flex-flow: column wrap;
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : '1.6rem')};
  text-align: ${({ contentAlign }) => contentAlign || 'center'};
  align-items: ${({ contentAlign }) =>
    contentAlign === 'left' ? 'flex-start' : contentAlign === 'right' ? 'flex-end' : 'center'};
  height: ${({ height }) => height || 'auto'};
  min-height: ${({ minHeight }) => minHeight || 'initial'};
  width: 100%;
  z-index: 1;

  ${Media.upToLarge()} {
    text-align: ${({ contentAlignTablet }) => contentAlignTablet || 'initial'};
  }

  ${Media.upToMedium()} {
    text-align: ${({ contentAlignMobile }) => contentAlignMobile || 'center'};
    align-items: ${({ contentAlignMobile }) =>
      contentAlignMobile === 'left'
        ? 'flex-start'
        : contentAlignMobile === 'right'
          ? 'flex-end'
          : contentAlignMobile || 'center'};
  }

  > .twitter-tweet {
    max-width: 100% !important;
    margin: auto !important;
  }

  > .twitter-tweet > iframe {
    max-width: 100%;
    width: 100% !important;
  }
`

export const TopicImage = styled.div<{
  iconColor?: string
  large?: boolean
  bgColor?: string
  margin?: string
  marginMobile?: string
  height?: number | string
  maxWidth?: number | string
  maxHeight?: number | string
  width?: number | string
  heightMobile?: number | string
  widthMobile?: number | string
  orderReverseTablet?: boolean
  orderReverseMobile?: boolean
  borderRadius?: number
  position?: string
  positionMobile?: string
  top?: number | string
  topMobile?: number | string
  left?: number | string
  leftMobile?: number | string
  right?: number | string
  rightMobile?: number | string
  bottom?: number | string
  bottomMobile?: number | string
}>`
  --size: ${({ large }) => (large ? '29rem' : '13.2rem')};
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || 'var(--size)')};
  max-width: ${({ maxWidth, width }) =>
    maxWidth !== undefined
      ? typeof maxWidth === 'number'
        ? `${maxWidth}px`
        : maxWidth
      : typeof width === 'number'
        ? `${width}px`
        : '100%'};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || 'var(--size)')};
  max-height: ${({ maxHeight, height }) =>
    maxHeight !== undefined
      ? typeof maxHeight === 'number'
        ? `${maxHeight}px`
        : maxHeight
      : typeof height === 'number'
        ? `${height}px`
        : height || '100%'};
  border-radius: ${({ borderRadius }) => (borderRadius ? `${borderRadius}px` : 0)};
  background: ${({ bgColor, iconColor }) => bgColor || iconColor || Color.neutral90};
  color: ${({ iconColor }) => iconColor || Color.neutral90};
  margin: ${({ margin }) => margin || '0 0 16px'};
  overflow: hidden;
  position: ${({ position }) => position || 'relative'};
  top: ${({ top }) => (typeof top === 'number' ? `${top}px` : top || 'initial')};
  left: ${({ left }) => (typeof left === 'number' ? `${left}px` : left || 'initial')};
  right: ${({ right }) => (typeof right === 'number' ? `${right}px` : right || 'initial')};
  bottom: ${({ bottom }) => (typeof bottom === 'number' ? `${bottom}px` : bottom || 'initial')};
  line-height: normal;

  ${Media.upToLarge()} {
    order: ${({ orderReverseTablet }) => (orderReverseTablet ? -1 : 'initial')};
  }

  ${Media.upToMedium()} {
    width: ${({ widthMobile }) => (typeof widthMobile === 'number' ? `${widthMobile}px` : widthMobile || '100%')};
    height: ${({ heightMobile, height }) =>
      heightMobile
        ? typeof heightMobile === 'number'
          ? `${heightMobile}px`
          : heightMobile
        : typeof height === 'number'
          ? `${height}px`
          : height || 'var(--size)'};
    order: ${({ orderReverseMobile }) => (orderReverseMobile ? -1 : 'initial')};
    margin: ${({ marginMobile }) => marginMobile || '0 0 1.6rem'};
  }

  > span {
    height: inherit;
    width: inherit;
    color: inherit;
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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
  width: 100%;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 28}px;
    font-weight: ${({ fontWeight }) => fontWeight || Font.weight.bold};
  }
`

export const TopicDescription = styled.p<{
  fontSize?: number
  fontSizeMobile?: number
  fontWeight?: number
  color?: string
  margin?: string
  minHeight?: number
  minHeightMobile?: number
}>`
  font-size: ${({ fontSize }) => fontSize || 21}px;
  color: ${({ color }) => color || 'inherit'};
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.medium};
  line-height: 1.4;
  margin: ${({ margin }) => margin || '16px 0'};
  text-align: inherit;
  min-height: ${({ minHeight }) => `${minHeight}px` || 'initial'};
  width: 100%;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 18}px;
    min-height: ${({ minHeightMobile }) =>
      typeof minHeightMobile === 'number' ? `${minHeightMobile}px` : minHeightMobile || 'initial'};
  }
`

export const TopicTable = styled.table`
  max-width: 100%;
  font-size: inherit;
  line-height: 1.2;
  font-weight: ${Font.weight.regular};

  > tbody {
    max-width: 100%;

    ${Media.upToMedium()} {
      display: flex;
      flex-flow: column wrap;
      gap: 1.6rem;
    }
  }

  > tbody > tr {
    &:first-child {
      padding: 0 1.6rem 0 0;

      ${Media.upToMedium()} {
        padding: 0 0 1.2rem;
      }
    }

    ${Media.upToMedium()} {
      display: flex;
      flex-flow: column wrap;
    }
  }

  > tbody > tr > td:first-child {
    color: ${Color.neutral30};
    padding: 0 1.6rem 0 0;

    ${Media.upToMedium()} {
      padding: 0 0 0.4rem;
    }
  }
`

export const LinkSection = styled.div<{
  columns?: number
  columnsMobile?: number
  bgColor?: string
  padding?: string
  gap?: number
  gapMobile?: number
}>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 2}, 1fr)`};
  background: ${({ bgColor }) => bgColor || Color.neutral100};
  border-radius: 2.8rem;
  padding: ${({ padding }) => padding || '2.4rem'};
  width: 100%;
  gap: ${({ gap }) => gap || 24}px;

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
    gap: ${({ gapMobile }) => gapMobile || 16}px;
  }
`

export const LinkColumn = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 0;
  width: 100%;

  > h5 {
    font-size: 2.1rem;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral0};
    margin: 0 0 1.6rem;
    line-height: 1.2;
  }
`

export const LinkItem = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 1.8rem;
  border-radius: 3.6rem;
  padding: 0.8rem 0;
  text-decoration: none;
  color: ${Color.neutral20};
  transition:
    background 0.2s ease-in-out,
    0.2s ease-in-out,
    padding 0.2s ease-in-out,
    color 0.2s ease-in-out;
  line-height: 1.3;
  gap: 1.6rem;

  ${Media.upToMedium()} {
    font-size: 1.6rem;
  }

  &:hover {
    color: ${Color.neutral0};
    background: ${Color.neutral80};
    padding: 0.8rem 0.8rem 0.8rem 2.1rem;

    > span {
      color: ${Color.neutral0};
      background: ${Color.neutral100};
      transform: translateX(0.3rem);
    }
  }

  &:last-child {
    margin-bottom: 0;
  }

  > span {
    --size: 4.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--size);
    width: var(--size);
    min-height: var(--size);
    min-width: var(--size);
    color: ${Color.neutral50};
    border-radius: 2.4rem;
    font-size: 2.4rem;
    transition: transform 0.2s ease-in-out;
  }
`

export const CTASectionWrapper = styled.section`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 2.8rem;
  padding: 0 2.4rem;
  background: transparent;
  text-align: center;
  margin: 10rem 0;
`

export const CTAImage = styled.div<{ bgColor?: string; color?: string }>`
  --size: 10rem;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: ${({ bgColor }) => bgColor || 'transparent'};
  padding: 0;
  color: ${({ color }) => color || 'inherit'};

  > img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    fill: currentColor;
  }
`

export const CTATitle = styled.h6`
  font-size: 4.8rem;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral0};
  margin: 0;
  line-height: 1.2;
  white-space: wrap;

  ${Media.upToMedium()} {
    font-size: 2.8rem;
  }
`

export const CTASubtitle = styled.p`
  font-size: 2.8rem;
  color: ${Color.neutral30};
  margin: 0;
  line-height: 1.2;
`

export const CTAButton = styled.a`
  --height: 5.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--height);
  padding: 1.2rem 2.4rem;
  font-size: 2.4rem;
  font-weight: ${Font.weight.medium};
  color: ${Color.neutral98};
  background: ${Color.neutral0};
  border: none;
  border-radius: var(--height);
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.2s ease-in-out,
    color 0.2s ease-in-out;

  &:hover {
    color: ${Color.neutral100};
    background: ${Color.neutral20};
  }
`

export const Breadcrumbs = styled.div<{ padding?: string }>`
  display: flex;
  justify-content: flex-start;
  font-size: 1.6rem;
  line-height: 1.2;
  padding: ${({ padding }) => padding || '0 0 2.4rem'};
  color: ${Color.neutral10};
  flex-flow: row wrap;

  ${Media.upToMedium()} {
    gap: 0.8rem;
    font-size: 1.4rem;
  }

  > h1 {
    font-size: inherit;
    margin: 0;
    line-height: inherit;
    color: inherit;
  }

  > a {
    color: ${Color.neutral40};
    text-decoration: none;
    margin-right: 0.8rem;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${Color.neutral0};
    }

    &:after {
      content: '→';
      margin-left: 0.8rem;
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
  font-size: 1.6rem;
  color: ${Color.neutral50};
`

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.8rem;
  margin: 2.4rem auto 0;
  padding: 0.4rem;
  background: ${Color.neutral100};
  color: ${Color.neutral10};
  border-radius: 2.1rem;
  width: min-content;
  font-size: 1.6rem;
  font-weight: ${Font.weight.medium};

  > a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 4rem;
    height: 4rem;
    border-radius: inherit;
    text-decoration: none;
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    background: transparent;
    transition:
      background 0.2s,
      color 0.2s;

    &:hover {
      background: ${Color.neutral80};
    }

    &.active {
      background: ${Color.neutral10};
      color: ${Color.neutral100};
    }
  }

  span {
    font-size: 1.6rem;
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
  --color: ${Color.neutral10};
  display: flex;
  flex-flow: column wrap;
  flex-flow: ${({ rowWrap }) => (rowWrap ? 'row wrap' : 'column wrap')};
  align-items: center;
  color: ${({ color }) => color || 'inherit'};
  margin: ${({ margin }) => margin || '10rem auto 5.6rem'};
  text-align: center;
  width: 100%;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  gap: ${({ gap }) => gap || 32}px;
  padding: ${({ padding }) => padding || '0'};

  ${Media.upToMedium()} {
    margin: ${({ marginMobile }) => marginMobile || '5.6rem auto 3.2rem'};
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
  lineHeight?: number
  lineHeightMobile?: number
}>`
  font-size: ${({ fontSize }) => fontSize || 51}px;
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.bold};
  color: ${({ color }) => color || 'inherit'};
  margin: 0;
  text-align: ${({ textAlign }) => textAlign || 'center'};
  line-height: ${({ lineHeight }) => lineHeight || 1.2};
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 38}px;
    line-height: ${({ lineHeightMobile }) => lineHeightMobile || 1.2};
  }
`

export const SectionTitleDescription = styled.p<{
  maxWidth?: number | string
  color?: string
  fontSize?: number
  fontSizeMobile?: number
  fontWeight?: number
  textAlign?: string
  margin?: string
}>`
  font-size: ${({ fontSize }) => fontSize || 28}px;
  color: ${({ color }) => color || 'inherit'};
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.medium};
  margin: ${({ margin }) => margin || '0'};
  line-height: 1.4;
  text-align: ${({ textAlign }) => textAlign || 'center'};
  width: 100%;
  max-width: ${({ maxWidth }) => (typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || '100%')};

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 21}px;
  }
`

export const SectionTitleIcon = styled.div<{ $size?: number; $multiple?: boolean }>`
  --size: ${({ $size }) => ($size ? `${$size}px` : '8.2rem')};
  width: 100%;
  height: var(--size);
  object-fit: contain;
  color: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.6rem;

  > span {
    height: var(--size);
    width: ${({ $multiple = false }) => ($multiple ? 'auto' : '100%')};
    color: inherit;
  }

  svg {
    width: ${({ $multiple = false }) => ($multiple ? 'auto' : '100%')};
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
  min-height: ${({ minHeight }) => (typeof minHeight === 'number' ? `${minHeight}px` : minHeight || '60rem')};
  margin: 0 auto;
  padding: 0;
  background: ${({ bgColor }) => bgColor || 'transparent'};
  border-radius: 3.2rem;

  ${Media.upToMedium()} {
    min-height: 30rem;
    max-width: 100%;
  }

  > img,
  > svg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`

export const HeroContainer = styled.div<{
  variant?: string
  maxWidth?: number | string
  padding?: string
  paddingMobile?: string
  minHeight?: string
  margin?: string
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: ${({ minHeight }) => minHeight || '60vh'};
  width: 100%;
  max-width: ${({ maxWidth }) => (typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || '130rem')};
  background: transparent;
  padding: ${({ padding }) => padding || '7.6rem 2rem 5.6rem'};
  overflow: hidden;
  margin: ${({ margin }) => margin || '0 auto'};

  ${Media.upToMedium()} {
    padding: ${({ paddingMobile }) => paddingMobile || '3.8rem 2rem'};
  }

  ${({ variant }) =>
    variant === 'secondary' &&
    css`
      flex-flow: row nowrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 7.4rem;

      ${Media.upToMedium()} {
        flex-flow: column wrap;
        gap: 3.2rem;
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

  > video {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }
`

export const HeroContent = styled.div<{ variant?: string; gap?: number; flex?: string }>`
  position: relative;
  z-index: 2;
  text-align: ${({ variant }) => (variant === 'secondary' ? 'left' : 'center')};
  color: ${Color.neutral0};
  gap: ${({ gap }) => gap || 32}px;
  display: flex;
  flex-flow: column wrap;
  max-width: 100%;
  flex: ${({ flex }) => flex || '1 1 0'};

  ${Media.upToMedium()} {
    flex: 0 0 auto;
  }

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
  maxWidth?: number
}>`
  font-size: ${({ fontSize }) => fontSize || 51}px;
  font-weight: ${({ fontWeight }) => fontWeight || Font.weight.bold};
  color: ${({ color }) => color || Color.neutral10};
  margin: 0;
  line-height: 1.2;
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  font-feature-settings: 'ss07' on; /* Headline Letters */
  word-wrap: break-word;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 38}px;
  }
`

export const HeroSubtitle = styled.p<{ variant?: string; color?: string }>`
  --color: ${({ color }) => color || Color.neutral10};
  font-size: 2.8rem;
  font-weight: ${Font.weight.bold};
  background: ${({ variant }) => (variant === 'pill' ? Color.neutral100 : 'transparent')};
  color: var(--color);
  padding: ${({ variant }) => (variant === 'pill' ? '0.8rem 1.6rem' : '0')};
  border-radius: ${({ variant }) => (variant === 'pill' ? '3.2rem' : '0')};
  border-bottom: ${({ variant }) => (variant === 'pill' ? 'none' : `0.4rem solid var(--color)`)};
  width: max-content;
  max-width: 100%;
  margin: ${({ variant }) => (variant === 'pill' ? '0 auto' : '0')};
  line-height: 1.5;

  ${Media.upToMedium()} {
    font-size: 2.8rem;
  }
`

export const HeroDescription = styled.span<{ fontSize?: number; fontSizeMobile?: number; color?: string }>`
  font-size: ${({ fontSize }) => fontSize || 26}px;
  font-weight: ${Font.weight.medium};
  color: ${({ color }) => color || Color.neutral10};
  margin: 1.6rem 0;
  padding: 0;
  line-height: 1.5;

  ${Media.upToMedium()} {
    font-size: ${({ fontSizeMobile }) => fontSizeMobile || 21}px;
  }

  > ol {
    padding: 0 0 0 2.4rem;
    font-size: inherit;
  }
`

export const HeroButtonWrapper = styled.div<{ gap?: number; width?: string }>`
  display: flex;
  gap: ${({ gap }) => gap || 24}px;
  margin: 3.2rem 0;
  flex-flow: row wrap;
  max-width: 100%;
  width: ${({ width }) => width || '100%'};

  ${Media.upToMedium()} {
    flex-flow: column wrap;
    align-items: center;
    margin: 0 auto;
  }
`

export const HeroImage = styled.div<{
  width?: number | string
  height?: number | string
  color?: string
  margin?: string
  marginMobile?: string
}>`
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || '100%')};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || 'auto')};
  max-width: 100%;
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
  padding: 6rem 6rem var(--paddingBottomOffset);
  border-radius: 6rem;
  background: ${({ bgColor }) => bgColor || Color.neutral90};
  color: ${({ color }) => color || Color.neutral0};
  position: relative;
  margin: ${({ touchFooter }) => (touchFooter ? '0 0 calc(-1 * var(--paddingBottomOffset))' : '2.4rem 0')};
  max-width: 100%;

  ${Media.upToMedium()} {
    grid-template-columns: ${({ columnsMobile }) => `repeat(${columnsMobile || 1}, 1fr)`};
    gap: 1.6rem;
    padding: 4.2rem 1.2rem var(--paddingBottomOffset);
  }
`

export const MetricsItem = styled.div<{ dividerColor?: string }>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  gap: 0.8rem;
  max-width: 100%;

  // only do &:not(:last-child)::after if dividerColor is provided
  ${({ dividerColor }) =>
    dividerColor
      ? `
    &:not(:last-child)::after {
      content: '';
      width: 0.2rem;
      height: 100%;
      padding: 0;
      margin: 0 0 0 auto;
      background: ${dividerColor || Color.neutral80};

      ${Media.upToMedium()} {
        width: 100%;
        height: 0.2rem;
        margin: 1.6rem 0;
      }
    }
  `
      : ''}

  > h2 {
    font-size: 4.8rem;
    font-weight: ${Font.weight.bold};
    margin: 0;
    color: inherit;
    width: 100%;
    max-width: 100%;
  }

  > p,
  > a {
    font-size: 2.1rem;
    font-weight: ${Font.weight.medium};
    line-height: 1.3;
    color: inherit;
    margin: 0;
    width: 100%;
    max-width: 70%;

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
    line-height: normal;
    height: 100%;
    width: 100%;
    font-size: 2.6rem;
    color: ${Color.neutral0};
    position: absolute;
    top: 0;
    left: 0;
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
      right: 0.5rem;
    }
  }

  .swiper-button-prev {
    z-index: 20;
    color: ${Color.neutral100};

    ${Media.upToMedium()} {
      left: 0.5rem;
      right: initial;
    }
  }
`

export const WidgetContainer = styled.div`
  display: flex;
  width: 47rem;
  max-width: 100%;
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
    margin: 1rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    transform: rotateZ(-15deg);
    line-height: 1;
  }

  ${Media.upToMedium()} {
    width: 100%;

    > div,
    > div > iframe {
      width: 100%;
      max-width: 100%;
    }
  }
`

export const ArticleContent = styled.div<{ maxWidth?: number | string }>`
  --maxWidth: ${({ maxWidth }) =>
    typeof maxWidth === 'string' ? maxWidth : typeof maxWidth === 'number' ? `${maxWidth}px` : '725px'};
  width: 100%;
  max-width: var(--maxWidth);
  flex: 3;
  padding: 0;
  border-radius: 2rem;
`

export const StickyMenu = styled.div`
  --maxWidth: 34.4rem;
  width: 100%;
  max-width: var(--maxWidth);
  height: min-content;
  min-height: 24rem;
  flex: 1;
  position: sticky;
  top: 10rem;
  background: ${Color.neutral100};
  color: ${Color.neutral0};
  padding: 3rem 2.4rem;
  border-radius: 3.2rem;

  ${Media.upToMedium()} {
    --maxWidth: 100%;
  }

  > b {
    display: block;
    font-size: 1.8rem;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral10};
    margin: 0 0 2.4rem;
  }
`

export const ArticleMainTitle = styled.h1<{ margin?: string; fontSize?: number }>`
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '6.7rem')};
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral10};
  margin: ${({ margin }) => margin || '0 0 1.6rem'};

  ${Media.upToMedium()} {
    font-size: 3.7rem;
  }
`

export const BodyContent = styled.div<{ color?: string }>`
  font-family: ${Font.familySerif};
  font-size: 1.8rem;
  line-height: 1.6;
  color: ${({ color }) => color || Color.neutral0};

  img {
    max-width: 100%;
    border-radius: 1rem;
    margin-top: 2rem;
    height: auto;
    object-fit: contain;
  }

  iframe {
    max-width: 100%;
  }

  a {
    color: ${Color.neutral20};
    text-decoration: underline;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${Color.neutral40};
    }
  }

  > p,
  > ul,
  > ul > li ul,
  > ol,
  > ol > li ul,
  > em,
  > p em {
    margin-bottom: 1.6rem;
    font-size: 2.1rem;
    line-height: 1.5;

    ${Media.upToMedium()} {
      font-size: 1.8rem;
    }
  }

  p.warn {
    display: block;
    font-weight: ${Font.weight.bold};
    font-style: normal;
    background: ${Color.cowfi_orange_pale};
    padding: 0.8rem;
    border-radius: 0.8rem;
  }

  > ul,
  > ul > li ul,
  > ol,
  > ol > li ul {
    padding: 0.8rem 0 0 2rem;

    > li,
    > li > p,
    > li > h3 {
      margin: 0 0 1.2rem;
      font-size: inherit;
      line-height: inherit;
    }
  }

  > blockquote {
    margin: 2.4rem 0;
    padding: 0.8rem 2.4rem;
    background: ${Color.neutral90};
    border-left: 0.4rem solid ${Color.neutral20};
    color: ${Color.neutral20};
    font-style: italic;
    font-size: inherit;

    > p {
      line-height: 1.6;
    }
  }

  // Add general styles for <table> with odd and even rows bg color
  table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    margin: 2.4rem 0;
    font-size: 1.5rem;
    line-height: 1.6;
    border-radius: 3.2rem;

    > thead {
      background: ${Color.neutral90};
      color: ${Color.neutral20};
    }

    > tbody {
      > tr {
        &:nth-child(odd) {
          background: ${Color.neutral98};
        }

        > td {
          padding: 0.8rem 1.2rem;
          border: 1px solid ${Color.neutral90};
        }
      }
    }
  }

  > h2,
  > h3,
  > h4,
  > h5,
  > h6 {
    font-family: ${Font.family};
    font-weight: bold;
    margin: 5.6rem 0 3.2rem;
  }

  > h2 {
    font-size: 3.8rem;

    ${Media.upToMedium()} {
      font-size: 2.4rem;
    }
  }

  > h3 {
    font-size: 3.2rem;

    ${Media.upToMedium()} {
      font-size: 2.2rem;
    }
  }

  > h4 {
    font-size: 2.8rem;

    ${Media.upToMedium()} {
      font-size: 2rem;
    }
  }

  > h5 {
    font-size: 2.4rem;

    ${Media.upToMedium()} {
      font-size: 1.8rem;
    }
  }

  > h6 {
    font-size: 2rem;

    ${Media.upToMedium()} {
      font-size: 1.6rem;
    }
  }
`

export const RelatedArticles = styled.div`
  font-size: 1.8rem;
  color: ${Color.neutral0};

  > ul {
    list-style: disc;
    padding: 0 0 0 2rem;

    > li {
      margin: 0 0 1.6rem;
      color: inherit;
    }

    > li > a {
      color: inherit;
      text-decoration: none;
      line-height: 1.2;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`

export const ArticleSubtitleWrapper = styled.div`
  color: ${Color.neutral40};
  font-weight: ${Font.weight.bold};
  font-size: 1.6rem;
  display: flex;
  flex-flow: row wrap;
  gap: 1rem;
  margin: 3.4rem 0;

  > div span {
    font-weight: normal;
  }
`

export const CategoryTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 2.4rem;
  font-size: 1.6rem;
  color: ${Color.neutral10};
  font-weight: ${Font.weight.medium};

  a {
    display: inline-block;
    padding: 0.8rem 1.2rem;
    background: ${Color.neutral98};
    border-radius: 1.6rem;
    text-decoration: none;
    transition:
      background 0.2s ease-in-out,
      color 0.2s ease-in-out;
    color: inherit;
    font-weight: inherit;
    font-size: inherit;

    &:hover {
      background: ${Color.neutral10};
      color: ${Color.neutral98};
    }
  }
`

export const DropDown = styled.div<{ maxWidth?: number; margin?: string }>`
  border: 0.1rem solid ${transparentize(Color.neutral100, 0.9)};
  border-radius: 0.6rem;
  width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
  padding: 0;
  background: ${Color.neutral0};
  color: ${Color.neutral100};
  font-size: 1.8rem;
  margin: ${({ margin }) => margin || '0 0 2.4rem'};
  display: flex;
  flex-flow: row nowrap;
  position: relative;

  &::after {
    content: '▼';
    position: absolute;
    border: 0;
    color: inherit;
    font-size: 1.6rem;
    display: flex;
    align-items: center;
    pointer-events: none;
    margin: auto;
    height: 100%;
    top: 0;
    bottom: 0;
    right: 1.2rem;
    cursor: pointer;
  }

  > select {
    appearance: none;
    cursor: pointer;
    height: 100%;
    padding: 1.2rem;
    width: 100%;
    display: block;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    border: 0;
    border-radius: inherit;
    background: ${transparentize(Color.neutral0, 0.9)};

    &:focus {
      outline: none;
    }

    > option {
      background-color: ${Color.neutral0};
      color: ${Color.neutral0};
    }
  }
`

export const ColorTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 3.2rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: ${Color.neutral70} ${Color.neutral90};

  &::-webkit-scrollbar {
    width: 0.8rem;
  }

  &::-webkit-scrollbar-track {
    background: ${Color.neutral90};
    border-radius: 1rem;
  }

  &::-webkit-scrollbar-thumb {
    background: ${Color.neutral70};
    border-radius: 1rem;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${Color.neutral50};
  }

  ${Media.upToMedium()} {
    overflow-x: auto;
  }
`

export const ColorTable = styled.table`
  --green: ${Color.cowfi_green};
  --red: ${Color.cowfi_orange_bright};
  --neutral: ${Color.cowfi_orange_pale};
  --border: ${Color.neutral10};
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  font-size: 3.2rem;
  font-weight: ${Font.weight.semibold};
  color: var(--neutral);
  border-radius: 3.2rem;

  ${Media.upToMedium()} {
    font-size: 2.1rem;
    max-width: 100%;
    display: block;
  }
`

export const ColorTableHeader = styled.th`
  background: var(--neutral);
  color: var(--red);
  text-align: left;
  border: 0.2rem solid var(--border);
  font-weight: inherit;
  line-height: 1.2;
  padding: 3rem;
  position: relative;

  &:first-child {
    background: transparent;
    position: relative;
    overflow: hidden;
  }
`

export const ColorTableCell = styled.td`
  background: var(--neutral);
  color: var(--red);
  line-height: 1.2;
  padding: 3rem;
  border: 0.2rem solid var(--border);
  text-align: left;
  font-weight: inherit;

  &.protected {
    background: var(--green);
    color: var(--neutral);
  }

  &.not-protected {
    background: var(--red);
    color: var(--neutral);
  }

  &.refund {
    background: var(--green);
    color: var(--neutral);
  }

  &.no-rebate {
    background: var(--neutral);
    color: var(--red);
  }

  &.max-protection {
    background: var(--green);
    color: var(--neutral);
  }
`

export const DisclaimerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.2rem;
  margin: 2.4rem 0 0;
  text-align: left;
  width: 100%;
  padding: 2.4rem;
  background-color: ${Color.neutral98};
  border-radius: 1.6rem;
  border-left: 0.6rem solid ${Color.cowfi_orange_bright};

  ${Media.upToMedium()} {
    grid-template-columns: 1fr;
    gap: 2.4rem;
    padding: 2rem;
  }
`

export const DisclaimerColumn = styled.div`
  display: flex;
  flex-direction: column;
`

export const DisclaimerList = styled.ul`
  margin: 0.8rem 0 0 1.6rem;
  padding: 0 0 0 0.4rem;
  font-size: 1.6rem;
  line-height: 1.5;
  color: ${Color.neutral30};

  ${Media.upToMedium()} {
    font-size: 1.5rem;
  }

  a {
    color: ${Color.neutral10};
    text-decoration: underline;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${Color.neutral30};
    }
  }
`

export const DisclaimerHighlight = styled.div`
  margin: 2.4rem 0 0;
  padding: 1.6rem;
  background-color: ${Color.neutral90};
  border-radius: 0.8rem;
`

export const DisclaimerSection = styled.div`
  margin: 2.4rem 0 0;
`
