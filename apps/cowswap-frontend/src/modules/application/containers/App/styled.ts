import svgBackgroundCowswapChristmasDarkMediumSrc from '@cowprotocol/assets/images/background-cowswap-christmas-dark-medium.svg'
import svgBackgroundCowswapChristmasDarkSmallSrc from '@cowprotocol/assets/images/background-cowswap-christmas-dark-small.svg'
import svgBackgroundCowswapChristmasDarkSrc from '@cowprotocol/assets/images/background-cowswap-christmas-dark.svg'
import svgBackgroundCowswapChristmasLightMediumSrc from '@cowprotocol/assets/images/background-cowswap-christmas-light-medium.svg'
import svgBackgroundCowswapChristmasLightSmallSrc from '@cowprotocol/assets/images/background-cowswap-christmas-light-small.svg'
import svgBackgroundCowswapChristmasLightSrc from '@cowprotocol/assets/images/background-cowswap-christmas-light.svg'
import svgBackgroundCowswapDarkmodeNocowsSrc from '@cowprotocol/assets/images/background-cowswap-darkmode-nocows.svg'
import svgBackgroundCowswapDarkmodeSrc from '@cowprotocol/assets/images/background-cowswap-darkmode.svg'
import svgBackgroundCowswapHalloweenDarkMediumSrc from '@cowprotocol/assets/images/background-cowswap-halloween-dark-medium.svg'
import svgBackgroundCowswapHalloweenDarkSrc from '@cowprotocol/assets/images/background-cowswap-halloween-dark.svg'
import svgBackgroundCowswapLightmodeNocowsSrc from '@cowprotocol/assets/images/background-cowswap-lightmode-nocows.svg'
import svgBackgroundCowswapLightmodeSrc from '@cowprotocol/assets/images/background-cowswap-lightmode.svg'
import { GRAFFITI_CANVAS_PNG_URL, wallCssBlendMode } from '@cowprotocol/common-const'
import { CowSwapTheme, Media, UI } from '@cowprotocol/ui'

import { darken, transparentize } from 'color2k'
import * as CSS from 'csstype'
import styled, { css } from 'styled-components/macro'

import type { PageBackgroundVariant } from '../../contexts/PageBackgroundContext'

export function isChristmasTheme(theme?: CowSwapTheme): boolean {
  if (!theme) {
    return false
  }

  return ['darkChristmas', 'lightChristmas'].includes(theme)
}

export function isSolanaTheme(theme?: CowSwapTheme): boolean {
  return theme === 'darkSolana'
}

/**
 * The canvas is 16:9 as served. Over-stating it is the safe direction: it only feeds the box's
 * min-height below, so a taller real canvas would be given less room than it needs and lose its
 * last rows, while a shorter one just leaves a little slack under the paint.
 */
const WALL_ASPECT = 1.7778

/**
 * The live graffiti wall, laid over the regular CoW Swap backdrop.
 *
 * Sized by the width of its box, never cover and never against the viewport height. Cover refits
 * the paint to the box's *height*, which grows ~100px as the widget, its quote and the banners
 * settle, zooming it ~10% and sliding it sideways on every load. Fitting it to the viewport instead
 * held still, but shrank the whole wall on a short window rather than simply showing less of it.
 * Width is both stable through that growth and independent of how tall the window is, so the paint
 * keeps one size and the box grows to hold it (see WALL_MIN_HEIGHT).
 */
const WALL_LAYER = `url(${GRAFFITI_CANVAS_PNG_URL}) no-repeat center top / 100% auto`

/**
 * Keeps the box at least as tall as the wall it carries, plus the slice the footer takes back with
 * its negative margin, so the wall's last rows land just above the footer instead of being clipped
 * off by a box the content alone would have left too short.
 */
const WALL_MIN_HEIGHT = `calc(100vw / ${WALL_ASPECT} + var(--marginBottomOffset))`

/** Rendered plaster, laid over the paint so the graffiti picks up the surface instead of floating on it. */
const WALL_SURFACE_LAYER =
  'repeating-linear-gradient(135deg, rgba(14, 15, 45, 0.55) 0 3px, rgba(120, 150, 255, 0.06) 3px 9px)'

/**
 * How much of the wall the panels over it give up, as `transparentize` amounts.
 * The inner surfaces sit on the outer one, so their alphas multiply: the pair is
 * tuned together to keep body text above the 4.5:1 contrast of the opaque theme.
 */
const WALL_VEIL_ALPHA = 0.28
const WALL_VEIL_DARKER_ALPHA = 0.4

export const AppWrapper = styled.div<Partial<CSS.Properties> & { $fullBleed?: boolean }>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: ${({ theme }) => (theme.isWidget ? 'auto' : '100vh')};
  height: ${({ theme }) => (theme.isWidget ? 'initial' : '100%')};
  position: relative;

  ${({ $fullBleed, theme }) =>
    $fullBleed &&
    !theme.isWidget &&
    css`
      min-height: 100dvh;
    `}
`

export const Marginer = styled.div`
  margin-top: ${({ theme }) => (theme.isWidget ? '0' : '5rem')};
`

export const SceneContainer = styled.div`
  position: absolute;
  bottom: calc(100% - 50px);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
  transform: translateY(16px);
`

export const FooterSlot = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
`

export const BodyWrapper = styled.div<{
  customTheme?: CowSwapTheme
  backgroundVariant?: PageBackgroundVariant
  $hasActiveSpeechBubbleNotification?: boolean
  $fullBleed?: boolean
}>`
  --marginBottomOffset: 65px;
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: flex-start;
  justify-content: center;
  flex: ${({ theme }) => (theme.isWidget ? '0 0 auto' : '1 1 auto')};
  z-index: 2;
  color: inherit;
  padding: ${({ theme, $hasActiveSpeechBubbleNotification }) =>
    theme.isWidget ? '16px 16px 0' : $hasActiveSpeechBubbleNotification ? '150px 16px 320px' : '150px 16px 176px'};
  margin: ${({ theme }) => (theme.isWidget ? '0' : '-76px auto calc(var(--marginBottomOffset) * -1)')};
  border-bottom-left-radius: ${({ theme }) => (theme.isWidget ? '0' : 'var(--marginBottomOffset)')};
  border-bottom-right-radius: ${({ theme }) => (theme.isWidget ? '0' : 'var(--marginBottomOffset)')};
  min-height: ${({ customTheme }) => (isSolanaTheme(customTheme) ? WALL_MIN_HEIGHT : 'initial')};
  background: ${({ theme, customTheme, backgroundVariant }) => {
    if (theme.isWidget) {
      return 'transparent'
    } else {
      const backgroundColor = theme.darkMode ? '#0E0F2D' : `var(${UI.COLOR_BLUE_300_PRIMARY})`
      let backgroundImage

      if (backgroundVariant === 'nocows') {
        backgroundImage = theme.darkMode
          ? `url(${svgBackgroundCowswapDarkmodeNocowsSrc})`
          : `url(${svgBackgroundCowswapLightmodeNocowsSrc})`
      } else if (customTheme === 'darkHalloween') {
        backgroundImage = `url(${svgBackgroundCowswapHalloweenDarkSrc})`
      } else if (isChristmasTheme(customTheme)) {
        backgroundImage = theme.darkMode
          ? `url(${svgBackgroundCowswapChristmasDarkSrc})`
          : `url(${svgBackgroundCowswapChristmasLightSrc})`
      } else {
        backgroundImage = theme.darkMode
          ? `url(${svgBackgroundCowswapDarkmodeSrc})`
          : `url(${svgBackgroundCowswapLightmodeSrc})`
      }

      const cowsLayer = `${backgroundImage} no-repeat bottom -1px center / contain`

      // The background shorthand only accepts a colour on its last layer.
      if (isSolanaTheme(customTheme)) {
        return `${cowsLayer}, ${WALL_SURFACE_LAYER}, ${WALL_LAYER} ${backgroundColor}`
      }

      return `${backgroundColor} ${cowsLayer}`
    }
  }};
  background-blend-mode: ${({ theme, customTheme }) =>
    isSolanaTheme(customTheme) ? `normal, normal, ${wallCssBlendMode(theme.darkMode)}` : 'normal'};

  /*
   * The wall is this page's backdrop, so the surfaces laid over it — the trade
   * widget above all — let a little of it through. Redeclaring the tokens here
   * rather than in the theme keeps it to this subtree: modals and dropdowns
   * portal to the body, and stay opaque over whatever they cover.
   */
  ${({ theme, customTheme }) =>
    isSolanaTheme(customTheme) &&
    css`
      ${UI.COLOR_PAPER}: ${transparentize(theme.paper, WALL_VEIL_ALPHA)};
      ${UI.COLOR_PAPER_DARKER}: ${transparentize(darken(theme.paper, 0.07), WALL_VEIL_DARKER_ALPHA)};
    `}

  ${Media.upToMedium()} {
    padding: ${({ theme, $hasActiveSpeechBubbleNotification }) =>
      theme.isWidget ? '0 0 16px' : $hasActiveSpeechBubbleNotification ? '150px 16px 330px' : '150px 16px 150px'};
    flex: none;
    min-height: ${({ theme }) => (theme.isWidget ? 'initial' : 'calc(100vh - 200px)')};
    background-size: ${({ customTheme }) => {
      if (isSolanaTheme(customTheme)) return 'contain, auto, cover'

      return customTheme === 'darkHalloween' || isChristmasTheme(customTheme) ? 'contain' : 'auto'
    }};

    ${({ customTheme, backgroundVariant, theme }) =>
      backgroundVariant !== 'nocows' &&
      customTheme === 'darkHalloween' &&
      !theme.isWidget &&
      `
        background-image: url(${svgBackgroundCowswapHalloweenDarkMediumSrc});
      `}

    ${({ customTheme, theme, backgroundVariant }) =>
      backgroundVariant !== 'nocows' &&
      isChristmasTheme(customTheme) &&
      !theme.isWidget &&
      `
        background-image: url(${theme.darkMode ? svgBackgroundCowswapChristmasDarkMediumSrc : svgBackgroundCowswapChristmasLightMediumSrc});
      `}
  }

  ${Media.upToSmall()} {
    padding: ${({ theme, $hasActiveSpeechBubbleNotification }) =>
      theme.isWidget ? '0 0 16px' : $hasActiveSpeechBubbleNotification ? '90px 16px 400px' : '90px 16px 200px'};
    min-height: ${({ theme }) => (theme.isWidget ? 'initial' : 'calc(100vh - 100px)')};
    background-size: ${({ customTheme }) => {
      if (isSolanaTheme(customTheme)) return 'contain, auto, cover'

      return customTheme === 'darkHalloween' || isChristmasTheme(customTheme) ? 'contain' : 'auto'
    }};

    ${({ customTheme, backgroundVariant, theme }) =>
      backgroundVariant !== 'nocows' &&
      customTheme === 'darkHalloween' &&
      !theme.isWidget &&
      `
        background-image: url(${svgBackgroundCowswapHalloweenDarkMediumSrc});
      `}

    ${({ customTheme, theme, backgroundVariant }) =>
      backgroundVariant !== 'nocows' &&
      isChristmasTheme(customTheme) &&
      !theme.isWidget &&
      `
        background-image: url(${theme.darkMode ? svgBackgroundCowswapChristmasDarkSmallSrc : svgBackgroundCowswapChristmasLightSmallSrc});
      `}
  }

  /* Last block wins: media queries add no specificity, so this must stay at the end. */
  ${({ $fullBleed, theme }) =>
    $fullBleed &&
    !theme.isWidget &&
    css`
      padding: 0;
      margin: 0;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      align-items: stretch;
      flex: 1 1 auto;
      min-height: 0;
      background: transparent;

      ${Media.upToMedium()} {
        padding: 0;
        flex: 1 1 auto;
        min-height: 0;
      }

      ${Media.upToSmall()} {
        padding: 0;
        min-height: 0;
      }
    `}
`
