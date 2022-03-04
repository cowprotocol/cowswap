import styled from 'styled-components/macro'
import { lighten, darken } from 'polished'
import { Shimmer } from 'react-shimmer'

export type ShimmerProps = {
  height: number
  width: number
  borderRadius?: string
  lightColor?: string
  darkColor?: string
}

const StyledShimmer = styled(Shimmer)<ShimmerProps>`
  border-radius: ${({ borderRadius }) => borderRadius || `15px`};
  background: linear-gradient(
    to right,
    ${({ lightColor, theme }) => lightColor || lighten(theme.darkMode ? 0.5 : 0.3, theme.bg1)} 8%,
    ${({ darkColor, theme }) => darkColor || darken(theme.darkMode ? 0 : 0.1, theme.bg1)} 18%,
    ${({ lightColor, theme }) => lightColor || lighten(theme.darkMode ? 0.5 : 0.3, theme.bg1)} 33%
  );
`

export default StyledShimmer
