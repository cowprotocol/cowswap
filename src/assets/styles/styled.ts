import styled from 'styled-components'
import * as CSS from 'csstype'

interface WrapProps {
  flexDir?: any
  alignItems?: any
  justifyCont?: any
  fs?: string
  fw?: string
  bgColor?: string
  br?: number
  grow?: string
  width?: any
  sidebar?: boolean
  rightSide?: boolean
  borders?: any
  overflow?: any
  inlineBlock?: boolean
  textLeft?: boolean
  visible?: boolean
  hiddenSM?: boolean
  hiddenXS?: boolean
  color?: any
  maxWidth?: any
  padding?: any
  margin?: any
  bs?: any
  flexWrap?: any
}

interface ColumnProps {
  xs?: any
  flexCol?: any
  flexRow?: any
  sm?: any
  md?: any
  lg?: any
  xl?: any
  stretch?: boolean
}

// with font size convert to rems
export const Txt = styled.div<
  Partial<
    CSS.Properties & {
      fs?: any
      fw?: string
      secondary?: boolean
      padding?: any
      margin?: any
      txtAlign?: any
      disabled?: boolean
    }
  >
>`
  display: inline-flex;
  text-align: ${(props) =>
    props.txtAlign ? (typeof props.txtAlign !== 'string' ? props.txtAlign[0] : props.txtAlign) : 'left'};
  font-size: ${(props) => (props.fs ? (typeof props.fs !== 'number' ? props.fs[0] / 16 : props.fs / 16) : 0.87)}rem;
  opacity: ${(props) => props.secondary && '0.5'};
  line-height: ${(props) =>
    props.fs
      ? typeof props.fs !== 'number'
        ? (props.fs[0] * 0.8 + props.fs[0]) / 16
        : (props.fs * 0.8 + props.fs) / 16
      : 1.1}rem;
  font-weight: ${(props) => (props.fw ? (typeof props.fw !== 'string' ? props.fw[0] : props.fw) : 'normal')};
  padding: ${(props) => (props.padding ? (typeof props.padding !== 'string' ? props.padding[0] : props.padding) : '0')};
  margin: ${(props) => (props.margin ? (typeof props.margin !== 'string' ? props.margin[0] : props.margin) : '0')};
  ${(props) => props.disabled && 'pointer-events:none;'}
  @media (min-width: 1024px) {
    padding: ${(props) =>
      props.padding ? (typeof props.padding !== 'string' ? props.padding[1] : props.padding) : '0'};
    margin: ${(props) => (props.margin ? (typeof props.margin !== 'string' ? props.margin[1] : props.margin) : '0')};
    text-align: ${(props) =>
      props.txtAlign ? (typeof props.txtAlign !== 'string' ? props.txtAlign[1] : props.txtAlign) : 'left'};
    font-size: ${(props) => (props.fs ? (typeof props.fs !== 'number' ? props.fs[1] / 16 : props.fs / 16) : 0.87)}rem;
    font-weight: ${(props) => (props.fw ? (typeof props.fw !== 'string' ? props.fw[1] : props.fw) : 'normal')};
    line-height: ${(props) =>
      props.fs
        ? typeof props.fs !== 'number'
          ? (props.fs[1] * 0.8 + props.fs[1]) / 16
          : (props.fs * 0.8 + props.fs) / 16
        : 1.1}rem;
  }
`

export const Wrap = styled.div<Partial<CSS.Properties & WrapProps>>`
  padding: ${(props) => (props.padding ? (typeof props.padding !== 'string' ? props.padding[0] : props.padding) : '0')};
  margin: ${(props) => (props.margin ? (typeof props.margin !== 'string' ? props.margin[0] : props.margin) : '0')};
  width: ${(props) => (props.width ? (typeof props.width !== 'string' ? props.width[0] : props.width) : 'auto')};
  height: ${(props) => props.height || 'auto'};
  max-width: ${(props) =>
    props.maxWidth ? (typeof props.maxWidth !== 'string' ? props.maxWidth[0] : props.maxWidth) : '100%'};
  max-height: ${(props) => props.maxHeight || 'none'};
  min-height: ${(props) => props.minHeight || 'auto'};
  display: flex;
  flex-direction: ${(props) =>
    props.flexDir ? (typeof props.flexDir !== 'string' ? props.flexDir[0] : props.flexDir) : 'row'};
  flex-wrap: ${(props) =>
    props.flexWrap
      ? (typeof props.flexWrap === 'string' && props.flexWrap === 'row-reverse') ||
        (typeof props.flexWrap === 'string' && props.flexWrap === 'row') ||
        (typeof props.flexWrap !== 'string' && props.flexWrap[0] === 'row-reverse') ||
        (typeof props.flexWrap !== 'string' && props.flexWrap[0] === 'row')
        ? 'wrap'
        : 'nowrap'
      : props.flexDir
      ? (typeof props.flexDir === 'string' && props.flexDir === 'column') ||
        (typeof props.flexDir !== 'string' && props.flexDir[0] === 'column')
        ? 'nowrap'
        : 'wrap'
      : 'wrap'};
  align-items: ${(props) =>
    props.alignItems ? (typeof props.alignItems !== 'string' ? props.alignItems[0] : props.alignItems) : 'flex-start'};
  justify-content: ${(props) =>
    props.justifyCont
      ? typeof props.justifyCont !== 'string'
        ? props.justifyCont[0]
        : props.justifyCont
      : 'flex-start'};
  box-shadow: ${(props) => props.bs || 'none'};
  background-color: ${(props) =>
    props.bgColor ? (typeof props.bgColor !== 'string' ? props.bgColor[0] : props.bgColor) : 'transparent'};
  flex-grow: ${(props) => props.grow || '0'};
  border-radius: ${(props) => (props.br ? props.br / 16 : 0)}rem;
  ${(props) =>
    props.borders
      ? typeof props.borders !== 'string'
        ? props.borders.length > 1
          ? props.borders[0].map((item: any) => `border-${item.side}: ${item.width} solid ${item.color || '#000'};`)
          : props.borders.map((item: any) => `border-${item.side}: ${item.width} solid ${item.color || '#000'};`)
        : `${props.borders ? props.borders : props.theme.appBody.border};`
      : 'border: 0;'};
  @media (min-width: 1024px) {
    padding: ${(props) =>
      props.padding ? (typeof props.padding !== 'string' ? props.padding[1] : props.padding) : '0'};
    margin: ${(props) => (props.margin ? (typeof props.margin !== 'string' ? props.margin[1] : props.margin) : '0')};
    width: ${(props) => (props.width ? (typeof props.width !== 'string' ? props.width[1] : props.width) : 'auto')};
    height: ${(props) => props.height || 'auto'};
    max-width: ${(props) =>
      props.maxWidth ? (typeof props.maxWidth !== 'string' ? props.maxWidth[1] : props.maxWidth) : '100%'};
    max-height: ${(props) => props.maxHeight || 'none'};
    min-height: ${(props) => props.minHeight || 'auto'};
    flex-direction: ${(props) =>
      props.flexDir ? (typeof props.flexDir !== 'string' ? props.flexDir[1] : props.flexDir) : 'row'};
    flex-wrap: ${(props) =>
      props.flexWrap
        ? (typeof props.flexWrap === 'string' && props.flexWrap === 'row-reverse') ||
          (typeof props.flexWrap === 'string' && props.flexWrap === 'row') ||
          (typeof props.flexWrap !== 'string' && props.flexWrap[1] === 'row-reverse') ||
          (typeof props.flexWrap !== 'string' && props.flexWrap[1] === 'row')
          ? 'wrap'
          : 'nowrap'
        : props.flexDir
        ? (typeof props.flexDir === 'string' && props.flexDir === 'column') ||
          (typeof props.flexDir !== 'string' && props.flexDir[1] === 'column')
          ? 'nowrap'
          : 'wrap'
        : 'wrap'};
    align-items: ${(props) =>
      props.alignItems
        ? typeof props.alignItems !== 'string'
          ? props.alignItems[1]
          : props.alignItems
        : 'flex-start'};
    justify-content: ${(props) =>
      props.justifyCont
        ? typeof props.justifyCont !== 'string'
          ? props.justifyCont[1]
          : props.justifyCont
        : 'flex-start'};
    box-shadow: ${(props) => props.bs || 'none'};
    background-color: ${(props) =>
      props.bgColor ? (typeof props.bgColor !== 'string' ? props.bgColor[1] : props.bgColor) : 'transparent'};
    flex-grow: ${(props) => props.grow || '0'};
    border-radius: ${(props) => (props.br ? props.br / 16 : 0)}rem;
    ${(props) =>
      props.borders
        ? typeof props.borders !== 'string'
          ? props.borders.length > 1
            ? props.borders[1].map((item: any) => `border-${item.side}: 1px solid ${item.color || '#000'};`)
            : props.borders.map((item: any) => `border-${item.side}: 1px solid ${item.color || '#000'};`)
          : ` ${props.borders ? props.borders : props.theme.appBody.border};`
        : 'border: 0;'}
  }
`

export const Row = styled.div<Partial<CSS.Properties & WrapProps>>`
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
  align-items: ${(props) => props.alignItems};
  justify-content: ${(props) => props.justifyContent || 'flex-start'};
  margin: ${(props) => props.margin || '0 -0.625rem'};
`

export const Column = styled.div<Partial<CSS.Properties & ColumnProps>>`
  padding: ${(props) => props.padding || '0 0.625rem'};
  max-width: ${(props) => (props.xs !== 'hidden' && props.xs ? props.xs + '%' : '100%')};
  flex: 0 0 ${(props) => (props.xs !== 'hidden' && props.xs ? props.xs + '%' : '100%')};
  ${(props) => props.flexCol && 'display:flex;flex-direction:column;'}
  ${(props) => props.flexRow && 'display:flex;flex-wrap:wrap; align-items:center'}
  ${(props) => props.stretch && 'height:100%;'}
  @media (max-width:767px) {
    ${(props) => props.xs === 'hidden' && 'display:none'};
  }
  @media (min-width: 768px) {
    max-width: ${(props) =>
      props.sm !== 'hidden' && props.sm ? props.sm + '%' : props.xs !== 'hidden' && props.xs ? props.xs + '%' : '100%'};
    flex: 0 0
      ${(props) =>
        props.sm !== 'hidden' && props.sm
          ? props.sm + '%'
          : props.xs !== 'hidden' && props.xs
          ? props.xs + '%'
          : '100%'};
  }
  @media (min-width: 768px) and (max-width: 990px) {
    ${(props) => props.sm === 'hidden' && 'display:none'};
  }
  @media (min-width: 991px) {
    max-width: ${(props) =>
      props.md !== 'hidden' && props.md
        ? props.md + '%'
        : props.sm !== 'hidden' && props.sm
        ? props.sm + '%'
        : props.xs !== 'hidden' && props.xs
        ? props.xs + '%'
        : '100%'};
    flex: 0 0
      ${(props) =>
        props.md !== 'hidden' && props.md
          ? props.md + '%'
          : props.sm !== 'hidden' && props.sm
          ? props.sm + '%'
          : props.xs !== 'hidden' && props.xs
          ? props.xs + '%'
          : '100%'};
  }
  @media (min-width: 991px) and (max-width: 1279px) {
    ${(props) => props.md === 'hidden' && 'display:none'};
  }
  @media (min-width: 1170px) {
    max-width: ${(props) =>
      props.lg !== 'hidden' && props.lg
        ? props.lg + '%'
        : props.md !== 'hidden' && props.md
        ? props.md + '%'
        : props.sm !== 'hidden' && props.sm
        ? props.sm + '%'
        : props.xs !== 'hidden' && props.xs
        ? props.xs + '%'
        : '100%'};
    flex: 0 0
      ${(props) =>
        props.lg !== 'hidden' && props.lg
          ? props.lg + '%'
          : props.md !== 'hidden' && props.md
          ? props.md + '%'
          : props.sm !== 'hidden' && props.sm
          ? props.sm + '%'
          : props.xs !== 'hidden' && props.xs
          ? props.xs + '%'
          : '100%'};
    ${(props) => props.lg === 'hidden' && 'display:none'};
  }
`
