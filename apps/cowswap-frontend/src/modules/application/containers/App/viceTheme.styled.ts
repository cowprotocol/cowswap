import svgBackgroundCowswapViceDarkSrc from '@cowprotocol/assets/images/background-cowswap-vice-dark.svg'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { css, FlattenSimpleInterpolation } from 'styled-components/macro'
import { VICE_THEME, VICE_THEME_PALETTE } from 'theme/viceTheme.constants'

const SKY = 'linear-gradient(180deg, #160028 0%, #2A0E4A 38%, #6B2A6E 72%, #C14A86 100%)'
const SKY_WITHOUT_SCENE = 'linear-gradient(180deg, #160028 0%, #2A0E4A 55%, #4A1C5E 100%)'
const SAND = '#1E002E'
const FOOTER_INK = '#B98BC4'

export const VICE_MENU_BAR_COLORS = {
  activeBackgroundDark: '#4A1C5E',
  activeFillDark: VICE_THEME_PALETTE.text,
  bgColorDark: 'rgb(255 227 239 / 8%)',
  bgDropdownColorDark: VICE_THEME_PALETTE.background,
  colorDark: VICE_THEME_PALETTE.text,
  defaultFillDark: 'rgb(255 227 239 / 45%)',
  hoverBackgroundDark: VICE_THEME_PALETTE.paper,
} as const

export function isViceTheme(theme?: CowSwapTheme): boolean {
  return theme === VICE_THEME
}

export function viceThemeBackground(showScene: boolean): string {
  if (!showScene) return SKY_WITHOUT_SCENE

  return `url(${svgBackgroundCowswapViceDarkSrc}) no-repeat bottom -1px center / contain, ${SKY}`
}

export function viceThemeCardCss(customTheme?: CowSwapTheme): FlattenSimpleInterpolation | null {
  if (!isViceTheme(customTheme)) return null

  return css`
    #card {
      box-shadow:
        0 0 0 1px rgb(240 93 149 / 45%),
        0 0 36px rgb(240 93 149 / 32%),
        0 18px 72px rgb(239 136 79 / 26%);
    }
  `
}

export function viceThemeFooterCss(customTheme?: CowSwapTheme): FlattenSimpleInterpolation | null {
  if (!isViceTheme(customTheme)) return null

  return css`
    > footer {
      --color: ${FOOTER_INK};
      --colorTitle: ${FOOTER_INK};
      --footerLogoColor: ${FOOTER_INK};
      --bgCollapsed: ${SAND};
      --bgExpanded: ${SAND};
    }
  `
}
