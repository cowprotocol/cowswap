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

/** The cow scene that sits at the foot of the page, as a background layer. */
function sceneLayer(darkMode: boolean, customTheme?: CowSwapTheme, backgroundVariant?: PageBackgroundVariant): string {
  let src

  if (backgroundVariant === 'nocows') {
    src = darkMode ? svgBackgroundCowswapDarkmodeNocowsSrc : svgBackgroundCowswapLightmodeNocowsSrc
  } else if (customTheme === 'darkHalloween') {
    src = svgBackgroundCowswapHalloweenDarkSrc
  } else if (isChristmasTheme(customTheme)) {
    src = darkMode ? svgBackgroundCowswapChristmasDarkSrc : svgBackgroundCowswapChristmasLightSrc
  } else {
    src = darkMode ? svgBackgroundCowswapDarkmodeSrc : svgBackgroundCowswapLightmodeSrc
  }

  return `url(${src}) no-repeat bottom -1px center / contain`
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
 * The wall's own rendered height, from the layer being drawn at the full width of the page. Doubles
 * as the page's minimum height, so the page is exactly one wall tall when the content is shorter:
 * the whole canvas is then on the page with its last rows at the very bottom, under the footer
 * rather than above it.
 */
const WALL_HEIGHT = `calc(100vw / ${WALL_ASPECT})`

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

/**
 * Closed, the footer paints nothing of its own: the scene behind it already supplies the dark mass
 * the opaque themes get from the footer's own colour, and a tint laid on top of that reads as a
 * rectangle ruled across the page.
 */
const WALL_FOOTER_BACKGROUND = 'transparent'

/**
 * Open, it carries columns of links that the wall runs straight through, so it needs a backdrop.
 * Faded in rather than switched on, because a flat start is that same rectangle: by the time the
 * first row of links arrives it is near solid, while the top edge still dissolves into the page.
 */
const WALL_FOOTER_BACKGROUND_EXPANDED = 'linear-gradient(to bottom, rgb(14 15 45 / 0%) 0, rgb(14 15 45 / 88%) 140px)'

/**
 * The footer's ink under this theme. Its own warm greys (#827474 text, #685B5B logos) read as dirt
 * against the blues of the scene they now sit on; this is drawn from the scene's own palette.
 */
const WALL_FOOTER_INK = '#8690D9'

/**
 * How solid the cow scene stays over the wall. Its silhouettes are opaque, and the hill alone hides
 * a tenth of the canvas, so paint that lands under it is simply gone. At this much the scene still
 * reads as a scene while the paint behind it comes through.
 */
const WALL_SCENE_OPACITY = 0.6

export const AppWrapper = styled.div<
  Partial<CSS.Properties> & {
    $fullBleed?: boolean
    customTheme?: CowSwapTheme
    backgroundVariant?: PageBackgroundVariant
  }
>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: ${({ theme }) => (theme.isWidget ? 'auto' : '100vh')};

  /*
   * The wall lives here, not on BodyWrapper: a background paints only inside its own box, and
   * BodyWrapper stops short of the footer, which is its sibling. Anything drawn near the foot of
   * the canvas landed ~150px above the bottom of the page as a result. This box spans the footer,
   * so the last rows reach the bottom and read through its 60% black.
   */
  ${({ theme, customTheme, backgroundVariant }) =>
    !theme.isWidget &&
    isSolanaTheme(customTheme) &&
    css`
      isolation: isolate;
      min-height: max(100vh, ${WALL_HEIGHT});
      background:
        ${WALL_SURFACE_LAYER},
        ${WALL_LAYER} ${theme.darkMode ? '#0E0F2D' : `var(${UI.COLOR_BLUE_300_PRIMARY})`};
      background-blend-mode: normal, ${wallCssBlendMode(theme.darkMode)};

      /*
       * The scene rides here too, not on BodyWrapper, whose bottom edge falls 65px inside the
       * footer: its own dark ground stopped there and the footer's background picked up from a
       * different shade, drawing two stacked rectangles across the page. Anchored to the foot of
       * this box it lands where the opaque themes put it, with the footer over it and no seam.
       * A background layer cannot carry an alpha, hence the pseudo-element.
       */
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        opacity: ${WALL_SCENE_OPACITY};
        background: ${sceneLayer(theme.darkMode, customTheme, backgroundVariant)};
      }
    `}
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

export const FooterSlot = styled.div<{ $overWall?: boolean }>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;

  /*
   * Overridden from here rather than through a prop on the shared Footer: the colour is this
   * theme's business, not the component's, and its own background token doubles as the social
   * icons' glyph colour, which has to stay opaque.
   */
  ${({ $overWall }) =>
    $overWall &&
    css`
      > footer {
        --color: ${WALL_FOOTER_INK};
        --colorTitle: ${WALL_FOOTER_INK};
        /* Read by the shared Footer's product logos, which have no token of their own. */
        --footerLogoColor: ${WALL_FOOTER_INK};
        --bgCollapsed: ${WALL_FOOTER_BACKGROUND};
        --bgExpanded: ${WALL_FOOTER_BACKGROUND_EXPANDED};
      }
    `}
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
  min-height: initial;
  background: ${({ theme, customTheme, backgroundVariant }) => {
    if (theme.isWidget) {
      return 'transparent'
    } else {
      const backgroundColor = theme.darkMode ? '#0E0F2D' : `var(${UI.COLOR_BLUE_300_PRIMARY})`
      const cowsLayer = sceneLayer(theme.darkMode, customTheme, backgroundVariant)

      // Transparent over AppWrapper, which carries both the wall and the scene under this theme.
      if (isSolanaTheme(customTheme)) {
        return 'transparent'
      }

      return `${backgroundColor} ${cowsLayer}`
    }
  }};
  background-blend-mode: normal;

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
      if (isSolanaTheme(customTheme)) return 'contain'

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
      if (isSolanaTheme(customTheme)) return 'contain'

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
