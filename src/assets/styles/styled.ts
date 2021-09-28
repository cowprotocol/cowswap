import styled from 'styled-components'
import * as CSS from 'csstype'

// with font size convert to rems
export const Txt = styled.span<
  Partial<
    CSS.Properties & {
      fs?: number
      secondary?: boolean
      center?: boolean
    }
  >
>`
  display: inline-flex;
  align-items: center;
  text-align: ${(props) => (props.center ? 'center' : 'left')};
  font-size: ${(props) => (props.fs ? props.fs : 12)}px;
  line-height: ${(props) => (props.fs ? props.fs * 1.21 + 'px' : 1.21)};
  color: ${({ theme, secondary }) => (secondary ? theme.text6 : theme.text1)};
  ${({ theme, fs }) => theme.mediaWidth.upToMedium`
    font-size: ${fs ? fs * 0.8 : 12}px;
  `}
`
