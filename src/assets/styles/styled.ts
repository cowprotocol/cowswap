import styled from 'styled-components'
import * as CSS from 'csstype'

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
  font-size: ${(props) => (props.fs ? (typeof props.fs !== 'number' ? props.fs[0] / 16 : props.fs / 16) : 1)}rem;
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
  color: ${({ theme }) => theme.text1};
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
