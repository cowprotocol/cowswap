import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

// with font size convert to rems
export const Txt = styled.span<{
  fontSize?: number
  fontWeight?: number
  lineHeight?: number
  center?: boolean
  gap?: number
}>`
  display: inline-flex;
  align-items: center;
  text-align: ${({ center }) => (center ? 'center' : 'left')};
  font-size: ${({ fontSize }) => `${fontSize ? fontSize : 12}px`};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : 'normal')};
  line-height: ${({ lineHeight }) => (lineHeight ? `${lineHeight}px` : 1.2)};
  color: var(${UI.COLOR_TEXT1});
  gap: ${({ gap }) => (gap ? `${gap}px` : 0)};
`
