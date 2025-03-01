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
  const buttonTextCustom = '#DC70FA'
  const blueDark2 = '#880194'
  const blueDark3 = '#A40DDB'
  const blueDark4 = '#2E0236'
  const blueLight1 = '#E9CBFF'
  const blueLight2 = '#CAAFDC'
  const black = '#22072F'
  const white = '#FFFFFF'
  const darkerDark = '#1D0923'
  const darkerLight = '#1D0923'
  const error = '#0E00D7'
  const paper = darkMode ? '#39183E' : white
  const background = darkMode ? black : '#F2EBFA'
  const alert = darkMode ? '#70FF4C' : '#1F4EDC'
  const success = darkMode ? '#02D725' : '#00737D'

  return {
    darkMode,
    primary: darkMode ? buttonTextCustom : blueDark2,
    background,
    paper,
    paperCustom: paper,
    paperDarkerCustom: darkMode ? darkerDark : darkerLight,
    paperDarkestCustom: darkMode ? darken(darkerDark, 0.05) : darken(darkerLight, 0.1),
    buttonTextCustom,
    text: darkMode ? '#E3DEE8' : '#300050',
    disabledText: darkMode ? '#C485DE' : '#745095',
    danger: darkMode ? '#5F2B27' : error,
    alert,
    warning: darkMode ? '#C86D51' : '#9E2A06',
    info: darkMode ? '#C866FE' : blueDark3,
    success,
    white: darkMode ? blueLight1 : white,
    black,
    blueDark2,
    bg2: darkMode ? blueDark3 : blueDark2,
    text1: darkMode ? blueLight1 : blueDark2,
    alert2: '#F96BAD',
    error: darkMode ? '#EE3068' : error,
    text4: darkMode ? '#e3c5ef' : '#000000b8',

    // ****** backgrounds ******
    bg5: darkMode ? ' #741D75' : ' #ECD6F1',
    bg8: darkMode ? blueDark4 : '#3F1545',

    // ****** other ******
    blue1: '#B640FF',
    blue2: darkMode ? '#D0A4FF' : '#9A0BC1',
    purple: '#577EFF',
    yellow: '#fff6dc',
    orange: '#FF784A',
    blueShade: '#0f2644',
    blueShade3: darkMode ? '##581C70' : '#DABDE2',

    // ****** other ******
    border: darkMode ? blueDark4 : '#030003',
    border2: darkMode ? '#4A2585' : blueLight2,

    disabled: darkMode ? '#e0c5ef' : blueLight2,

    green1: darkMode ? '#27B0B0' : '#007F6E',
    yellow3: '#F3B71E',
    gradient1: `linear-gradient(145deg, ${paper}, ${background})`,
    gradient2: `linear-gradient(250deg, ${transparentize(alert, 0.92)} 10%, ${transparentize(
      success,
      0.92,
    )} 50%, ${transparentize(success, 0.92)} 100%);`,
    boxShadow1: darkMode ? '0 24px 32px rgba(0, 0, 0, 0.06)' : '0 12px 12px rgba(63, 5, 101, 0.06)',
    boxShadow2: '0 4px 12px 0 rgb(0 0 0 / 15%)',
    shadow1: darkMode ? '#030003' : '#C52FEF',
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
