import { transparentize } from 'polished'
import { css, keyframes } from 'styled-components/macro'

export const Color = {
  white: '#FFFFFF',
  black: '#000000',
  orange: '#ED6834',
  border: transparentize(0.75, '#979797'),
  borderGradient: `linear-gradient(to bottom, ${transparentize(0.75, '#979797')}, ${transparentize(1, '#979797')})`,
  darkBlue: '#052B65',
  darkBlue2: '#0D3673',
  darkBlue3: '#042a63',
  darkBlue4: '#042456',
  lightBlue: '#CAE9FF',
  lightBlue2: 'rgb(176 194 255)',
  lightBlue3: 'rgb(118 167 230)',
  grey: 'rgb(236, 241, 248)',
  grey2: 'rgb(201 211 226)',
  grey3: '#737b96',
  text1: '#405A82',
  text2: '#95BAEF',
  danger: '#D41300',
  warning: '#D94719',
  alert: '#DB971E',
  information: '#0d5ed9',
  success: '#007B28',
  gradient: 'linear-gradient(45deg,#FFE7E0 0%,#F8DBF4 20%,#C4DDFF 60%,#CAE9FF 100%)',
  gradient2: 'linear-gradient(0deg, #071B3B 0%, #052B65 100%)',
  gradientMesh: css`
    background-color: hsla(142, 0%, 100%, 1);
    background-image: radial-gradient(at 5% 70%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 47% 40%, hsla(214, 100%, 88%, 1) 0px, transparent 50%),
      radial-gradient(at 73% 3%, hsla(308, 67%, 91%, 1) 0px, transparent 50%),
      radial-gradient(at 44% 13%, hsla(13, 100%, 93%, 1) 0px, transparent 50%),
      radial-gradient(at 61% 70%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 32% 81%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 19% 39%, hsla(204, 100%, 89%, 1) 0px, transparent 50%);
  `,
} as const

export enum TransitionDuration {
  slow = 500,
  medium = 250,
  fast = 125,
}

const transitions = {
  duration: {
    slow: `${TransitionDuration.slow}ms`,
    medium: `${TransitionDuration.medium}ms`,
    fast: `${TransitionDuration.fast}ms`,
  },
  timing: {
    ease: 'ease',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const textFadeIn = css`
  animation: ${fadeIn} ${transitions.duration.fast} ${transitions.timing.in};
`
