import { transparentize } from 'polished'
import { css, keyframes } from 'styled-components'
import styled from 'styled-components'

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

  // CoW AMM theme
  cowammBlack: '#211715',
  cowammLightBlue: '#57C3FF',
  cowammBlue: '#3A86FF',
  cowammWhite: '#f6f2e7',
  cowammLightPurple: '#B462FA',
  cowammPurple: '#8738EC',
  cowammPink: '#FB50C0',
  cowammYellow: '#F5BD24',
  cowammLightOrange: '#FE970C',
  cowammOrange: '#FB5607',
  cowammSand: '#E3DED4',
} as const

export const Defaults = {
  borderRadius: '1.6rem',
  pageMaxWidth: 126,
  boxShadow: `0 2.4rem 2.4rem ${Color.darkBlue3}`,
}

export const Font = {
  default: "'Averta', 'Helvetica Neue', Helvetica, sans-serif",
  arial: 'Arial, Helvetica, sans-serif',
  flecha: "'Flecha S', 'Helvetica Neue', Helvetica, sans-serif",
  circular: "'CircularXXSub-Book', 'Helvetica Neue', Helvetica, sans-serif",
  sizeDefault: '1.6rem',
  weightLight: 300,
  weightNormal: 400,
  weightMedium: 600,
  weightBold: 900,
}

export const Media = {
  tinyScreen: '320px',
  xSmallScreen: '430px',
  smallScreen: '736px',
  smallScreenUp: '737px',
  mediumScreenSmall: '992px',
  mediumEnd: '1024px',
  desktopScreen: '1200px',
  desktopScreenLarge: '1400px',
  get tinyDown(): string {
    return `@media only screen and (max-width : ${this.tinyScreen})`
  },
  get xSmallDown(): string {
    return `@media only screen and (max-width : ${this.xSmallScreen})`
  },
  get mobile(): string {
    return `@media only screen and (max-width : ${this.smallScreen})`
  },
  get smallUp(): string {
    return `@media only screen and (min-width : ${this.smallScreen})`
  },
  get mediumUp(): string {
    return `@media only screen and (min-width : ${this.mediumScreenSmall})`
  },
  get mediumDown(): string {
    return `@media only screen and (max-width : ${this.mediumEnd})`
  },
  get mediumOnly(): string {
    return `@media only screen and (min-width : ${this.smallScreenUp}) and (max-width : ${this.mediumEnd})`
  },
  get desktopOnly(): string {
    return `@media only screen and (min-width : ${this.mediumEnd}) and (max-width : ${this.desktopScreen})`
  },
  get desktopDown(): string {
    return `@media only screen and (max-width : ${this.desktopScreen})`
  },
  get desktop(): string {
    return `@media only screen and (min-width : ${this.desktopScreen})`
  },
  get desktopLarge(): string {
    return `@media only screen and (min-width: ${this.desktopScreenLarge})`
  },
  get desktopLargeDown(): string {
    return `@media only screen and (max-width: ${this.desktopScreenLarge})`
  },
  get tabletPortrait(): string {
    return `@media (min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: portrait)`
  },
  get tabletLandscape(): string {
    return `@media (min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: landscape)`
  },
  get tablet(): string {
    return `@media (min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletPortrait}, ${this.tabletLandscape}`
  },
  get tabletNoPortrait(): string {
    return `@media (min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletLandscape}`
  },
  get tabletSmall(): string {
    return `@media (min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumScreenSmall})`
  },
}

export const flexColumnNoWrap = css`
  display: flex;
  flex-flow: column nowrap;
`

export const flexRowNoWrap = css`
  display: flex;
  flex-flow: row nowrap;
`

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

type TextColorKey = keyof typeof Color

export const TextColor = styled.span<{ color: TextColorKey; italic?: boolean }>`
  font-style: ${({ italic }) => (italic ? 'italic' : 'normal')};
  color: ${({ color }) => Color[color]};
  width: 100%;
  display: inline;
`
