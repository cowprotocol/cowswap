import { transparentize } from 'polished'
import { css, keyframes } from 'styled-components/macro'

export const Color = {
  white: '#FFFFFF',
  black: '#000000',
  orange: '#ED6834',
  border: transparentize(0.75, '#979797'),
  borderGradient: `linear-gradient(to bottom, ${transparentize(0.75, '#979797')}, ${transparentize(1, '#979797')})`,
  darkBlue: 'rgb(74, 5, 101)',
  darkBlue2: 'rgb(98, 13, 115)',
  darkBlue3: 'rgb(77, 4, 99)',
  darkBlue4: 'rgb(70, 4, 86)',
  lightBlue: 'rgb(251, 202, 255)',
  lightBlue2: 'rgb(176 194 255)',
  lightBlue3: 'rgb(118 167 230)',
  grey: 'rgb(244, 236, 248)',
  grey2: 'rgb(201 211 226)',
  grey3: '#737b96',
  text1: '#405A82',
  text2: '#95BAEF',
  danger: '#D41300',
  warning: '#D94719',
  alert: '#DB971E',
  information: '#0d5ed9',
  success: '#007B28',
  gradient: 'linear-gradient(45deg, #FFE7E0 0%, #F8DBF4 20%, #e4c4ff 60%,#f9caff 100%)',
  gradient2: 'linear-gradient(0deg,rgb(44, 7, 59) 0%,rgb(74, 5, 101) 100%)',
  gradientMesh: css`
    background-color: hsla(142, 0%, 100%, 1);
    background-image: radial-gradient(at 5% 70%, rgb(223, 199, 255) 0px, transparent 50%),
      radial-gradient(at 47% 40%, rgb(238, 194, 255) 0px, transparent 50%),
      radial-gradient(at 73% 3%, hsla(308, 67%, 91%, 1) 0px, transparent 50%),
      radial-gradient(at 44% 13%, hsla(13, 100%, 93%, 1) 0px, transparent 50%),
      radial-gradient(at 61% 70%, rgb(233, 199, 255) 0px, transparent 50%),
      radial-gradient(at 32% 81%, rgb(242, 199, 255) 0px, transparent 50%),
      radial-gradient(at 19% 39%, rgb(244, 199, 255) 0px, transparent 50%);
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
