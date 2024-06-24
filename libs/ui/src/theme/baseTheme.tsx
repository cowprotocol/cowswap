import { transparentize, darken } from 'color2k'
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

    // ****** backgrounds ******
    bg5: darkMode ? '#1d4373' : '#D5E9F0',
    bg8: darkMode ? blueDark4 : '#152943',

    // ****** other ******
    blue1: '#3F77FF',
    blue2: darkMode ? '#a3beff' : '#0c40bf',
    purple: '#8958FF',
    yellow: '#fff6dc',
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
    gradient2: `linear-gradient(250deg, ${transparentize(alert, 0.92)} 10%, ${transparentize(
      success,
      0.92
    )} 50%, ${transparentize(success, 0.92)} 100%);`,
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
      scrollbar-color: var(${UI.COLOR_PAPER_DARKEST}), var(${UI.COLOR_PAPER_DARKER});
      scroll-behavior: smooth;

      &::-webkit-scrollbar {
        background: var(${UI.COLOR_PAPER_DARKER});
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(${UI.COLOR_PAPER_DARKEST});
        border: 3px solid var(${UI.COLOR_PAPER_DARKEST});
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
