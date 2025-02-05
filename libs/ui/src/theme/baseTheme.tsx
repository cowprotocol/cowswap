import { darken } from 'color2k'
import { transparentize } from 'polished'
// eslint-disable-next-line no-restricted-imports
import { CowProtocolTheme } from 'styled-components'
import { css } from 'styled-components/macro'

import { Colors } from './typings'

import { UI } from '../enum'
import { CowSwapTheme } from '../types'

export function baseTheme<T extends CowProtocolTheme>(theme: CowSwapTheme): CowProtocolTheme {
  const darkMode = theme === 'dark'

  return {
    ...colors(darkMode),
    ...utils(darkMode),
  } as T
}

function colors(darkMode: boolean): Colors {
  // TODO(theme-cleanup): These colors were migrated from apps/cow-fi/styles/variables.ts
  // They should be reviewed and potentially consolidated with the existing color system.
  // The cowfi_ prefix helps identify their origin and marks them for future cleanup.
  const buttonTextCustom = '#65D9FF'
  const blueDark2 = '#004293'
  const blueDark3 = '#0d5ed9'
  const blueDark4 = '#021E34'
  const blueLight1 = '#CAE9FF'
  const blueLight2 = '#afcbda'
  const black = '#07162D'
  const white = '#FFFFFF'
  const darkerDark = '#090A20'
  const darkerLight = '#090A20'
  const error = '#D41300'
  const paper = darkMode ? '#18193B' : white
  const background = darkMode ? black : '#ECF1F8'
  const alert = darkMode ? '#FFCA4A' : '#DB971E'
  const success = darkMode ? '#00D897' : '#007B28'
  const cowfi_orange = '#ED6834'
  const cowfi_darkBlue = '#052B65'
  const cowfi_darkBlue2 = '#0D3673'
  const cowfi_darkBlue3 = '#042a63'
  const cowfi_darkBlue4 = '#042456'
  const cowfi_lightBlue2 = 'rgb(176 194 255)'
  const cowfi_lightBlue3 = 'rgb(118 167 230)'
  const cowfi_grey = 'rgb(236, 241, 248)'
  const cowfi_grey2 = 'rgb(201 211 226)'
  const cowfi_grey3 = '#737b96'
  const cowfi_text1 = '#405A82'
  const cowfi_text2 = '#95BAEF'
  const cowfi_border = transparentize('0.75', '#979797')
  const cowfi_borderGradient = `linear-gradient(to bottom, ${transparentize('0.75', '#979797')}, ${transparentize('1.0', '#979797')})`
  const cowfi_gradient = 'linear-gradient(45deg,#FFE7E0 0%,#F8DBF4 20%,#C4DDFF 60%,#CAE9FF 100%)'
  const cowfi_gradient2 = `linear-gradient(0deg, #071B3B 0%, ${cowfi_darkBlue} 100%)`
  const cowfi_gradientMesh = css`
    background-color: hsla(142, 0%, 100%, 1);
    background-image: radial-gradient(at 5% 70%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 47% 40%, hsla(214, 100%, 88%, 1) 0px, transparent 50%),
      radial-gradient(at 73% 3%, hsla(308, 67%, 91%, 1) 0px, transparent 50%),
      radial-gradient(at 44% 13%, hsla(13, 100%, 93%, 1) 0px, transparent 50%),
      radial-gradient(at 61% 70%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 32% 81%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 19% 39%, hsla(204, 100%, 89%, 1) 0px, transparent 50%);
  `

  return {
    darkMode,
    primary: darkMode ? buttonTextCustom : blueDark2,
    background,
    paper,
    paperCustom: paper,
    paperDarkerCustom: darkMode ? darkerDark : darkerLight,
    paperDarkestCustom: darkMode ? darken(darkerDark, 0.05) : darken(darkerLight, 0.1),
    buttonTextCustom,
    text: darkMode ? '#DEE3E6' : '#00234E',
    disabledText: darkMode ? '#86B2DC' : '#506B93',
    danger: darkMode ? '#f44336' : error,
    alert,
    warning: darkMode ? '#ED6237' : '#D94719',
    info: darkMode ? '#428dff' : blueDark3,
    success,
    white: darkMode ? blueLight1 : white,
    black,
    blueDark2,
    bg2: darkMode ? blueDark3 : blueDark2,
    text1: darkMode ? blueLight1 : blueDark2,
    alert2: '#F8D06B',
    error: darkMode ? '#EB3030' : error,
    text4: darkMode ? 'rgba(197, 218, 239, 0.7)' : '#000000b8',
    cowfi_orange,
    cowfi_darkBlue,
    cowfi_darkBlue2,
    cowfi_darkBlue3,
    cowfi_darkBlue4,
    cowfi_lightBlue2,
    cowfi_lightBlue3,
    cowfi_grey,
    cowfi_grey2,
    cowfi_grey3,
    cowfi_text1,
    cowfi_text2,
    cowfi_border,
    cowfi_borderGradient,
    cowfi_gradient,
    cowfi_gradient2,
    cowfi_gradientMesh,

    // ****** backgrounds ******
    bg5: darkMode ? '#1d4373' : '#D5E9F0',
    bg8: darkMode ? blueDark4 : '#152943',

    // ****** other ******
    blue1: '#3F77FF',
    blue2: darkMode ? '#a3beff' : '#0c40bf',
    orange: '#FF784A',
    blueShade: '#0f2644',
    blueShade3: darkMode ? '#1c416e' : '#bdd6e1',

    // ****** other ******
    border: darkMode ? blueDark4 : '#000000',
    border2: darkMode ? '#254F83' : blueLight2,

    disabled: darkMode ? 'rgba(197, 218, 239, 0.4)' : blueLight2,

    green1: darkMode ? '#27AE60' : '#007D35',
    yellow3: '#F3B71E',
    gradient1: `linear-gradient(145deg, ${paper}, ${background})`,
    gradient2: `linear-gradient(250deg, ${transparentize(0.92, alert)} 10%, ${transparentize(
      0.92,
      success,
    )} 50%, ${transparentize(0.92, success)} 100%);`,
    boxShadow1: darkMode ? '0 24px 32px rgba(0, 0, 0, 0.06)' : '0 12px 12px rgba(5, 43, 101, 0.06)',
    boxShadow2: '0 4px 12px 0 rgb(0 0 0 / 15%)',
    shadow1: darkMode ? '#000' : '#2F80ED',
  }
}

function utils(darkMode: boolean) {
  return {
    shimmer: css`
      background-image: linear-gradient(
        90deg,
        transparent 0,
        var(${UI.COLOR_PAPER}) 20%,
        var(${UI.COLOR_PAPER_DARKER}) 60%,
        transparent
      );
      animation: shimmer 2s infinite;
      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `,
    colorScrollbar: css`
      scrollbar-color: var(${UI.COLOR_PAPER_DARKEST}), var(${UI.COLOR_TEXT_OPACITY_10});
      scroll-behavior: smooth;

      &::-webkit-scrollbar {
        background: var(${UI.COLOR_PAPER_DARKER});
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(${UI.COLOR_TEXT_OPACITY_10});
        border: 3px solid var(${UI.COLOR_TEXT_OPACITY_10});
        border-radius: 14px;
        background-clip: padding-box;
      }
    `,
    invertImageForDarkMode: darkMode ? 'filter: invert(1) grayscale(1);' : null,
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  }
}
