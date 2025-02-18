import { css } from 'styled-components/macro'

import { fadeIn } from './animations'
import { transitions } from './transitions'

export const textFadeIn = css`
  animation: ${fadeIn} ${transitions.duration.fast} ${transitions.timing.in};
`
