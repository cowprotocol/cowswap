import { transparentize } from 'polished'
import { css } from 'styled-components/macro'

export const Color = {
  // Neutral colors
  neutral100: '#FFFFFF',
  neutral98: '#FFF8F7',
  neutral95: '#FFEDEC',
  neutral90: '#F0DEDE',
  neutral80: '#D4C3C2',
  neutral70: '#B8A7A7',
  neutral60: '#9C8D8D',
  neutral50: '#827474',
  neutral40: '#685B5B',
  neutral30: '#504444',
  neutral20: '#382E2E',
  neutral10: '#23191A',
  neutral0: '#000000',

  // TODO(theme-cleanup): These colors below were migrated
  // TODO(theme-cleanup): They should be reviewed and potentially consolidated with the existing color system.

  // CoW Protocol Colors
  cowfi_orange: '#ED6834',
  cowfi_blue: '#00A1FF',
  cowfi_green: '#2b6f0b',
  cowfi_darkBlue: '#052B65',
  cowfi_darkBlue2: '#0D3673',
  cowfi_darkBlue3: '#042a63',
  cowfi_darkBlue4: '#042456',
  cowfi_darkBlue5: '#005EB7',
  cowfi_lightBlue1: '#CCF8FF',
  cowfi_lightBlue2: 'rgb(176 194 255)',
  cowfi_lightBlue3: 'rgb(118 167 230)',
  cowfi_lightBlue4: '#99ECFF',
  cowfi_white2: '#FFF8F7',
  cowfi_grey: 'rgb(236, 241, 248)',
  cowfi_grey2: 'rgb(201 211 226)',
  cowfi_grey3: '#737b96',
  cowfi_text1: '#405A82',
  cowfi_text2: '#95BAEF',

  // CoW AMM Colors
  cowamm_green: '#BCEC79',
  cowamm_dark_green: '#194D05',
  cowamm_dark_green2: '#224D22',
  cowamm_light_green: '#DCF8A7',

  // Social/Brand Colors
  cowfi_purple1: '#8702AA',
  cowfi_purple2: '#FCCAF2',
  cowfi_purple3: '#66018E',
  cowfi_discord_pink: '#FDADA3',
  cowfi_snapshot_red: '#710408',
} as const

// Gradients and special effects
export const Gradients = {
  cowfi_border: transparentize('0.75', '#979797'),
  cowfi_borderGradient: `linear-gradient(to bottom, ${transparentize('0.75', '#979797')}, ${transparentize('1.0', '#979797')})`,
  cowfi_gradient: 'linear-gradient(45deg,#FFE7E0 0%,#F8DBF4 20%,#C4DDFF 60%,#CAE9FF 100%)',
  cowfi_gradient2: 'linear-gradient(0deg, #071B3B 0%, #052B65 100%)',
  cowfi_gradientMesh: css`
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

// Word tag colors
export const WordTags = {
  blue: {
    text: '#012f7a',
    background: '#65d9ff',
  },
  orange: {
    text: '#ec4612',
    background: '#fee7cf',
  },
  purple: {
    text: '#f996ee',
    background: '#490072',
  },
} as const
