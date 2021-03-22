import { css } from 'styled-components'

import Logo from 'assets/svg/logo.svg'
import LogoDark from 'assets/svg/logo_white.svg'

import { Colors } from 'theme/styled'
import { colors as colorsUniswap } from '@src/theme'

export { TYPE } from '@src/theme'
export * from '@src/theme/components'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsUniswap(darkMode),

    // ****** base ******

    // ****** text ******
    text2: darkMode ? '#DCDCDC' : '#565A69',

    // ****** backgrounds / greys ******
    bg1: darkMode ? '#1E1F2C' : '#FFFFFF',
    bg2: darkMode ? '#2C2D3F' : '#F7F8FA',
    bg3: darkMode ? '#1E1F2C' : '#EDEEF2',

    // ****** specialty colors ******
    advancedBG: darkMode ? '#2B2D3F' : 'rgb(247 248 250)',

    // ****** primary colors ******
    primary1: darkMode ? '#3F77FF' : '#8958FF',
    primary5: darkMode ? '#153d6f70' : 'rgba(137,88,255,0.6)',

    // ****** color text ******
    primaryText1: darkMode ? '#6da8ff' : '#8958FF',

    // ****** secondary colors ******
    secondary1: darkMode ? '#2172E5' : '#8958FF',
    // secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : 'rgba(137,88,255,0.6)',

    // ****** other ******
    blue1: '#3F77FF',
    purple: '#8958FF',
    border: darkMode ? '#3a3b5a' : 'rgb(58 59 90 / 10%)',
    disabled: darkMode ? '#31323e' : 'rgb(237, 238, 242)'
  }
}

export function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
    body: {
      background: css`
        background: ${colorsTheme.primary1};
      `
    },
    logo: { src: `${darkMode ? LogoDark : Logo}`, alt: 'GP Logo', width: '24px', height: 'auto' },
    header: {
      border: `1px solid ${colorsTheme.border}`
    },
    buttonPrimary: {
      background: css`
        background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
      `,
      fontSize: '16px',
      fontWeight: '500',
      border: `0`,
      borderRadius: '9px',
      boxShadow: `none`
    },
    buttonLight: {
      background: css`
        background: ${colorsTheme.primary5};
      `,
      backgroundHover: `${colorsTheme.primary4}`,
      fontSize: '16px',
      fontWeight: '500',
      border: `none`,
      borderHover: 'inherit',
      borderRadius: '9px',
      boxShadow: `none`
    },
    bgLinearGradient: css`
      background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
    `
  }
}
