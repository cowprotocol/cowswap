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

/** The live graffiti wall, laid over the regular CoW Swap backdrop. */
const WALL_LAYER = `url(${GRAFFITI_CANVAS_PNG_URL}) no-repeat center / cover`

/** Rendered plaster, laid over the paint so the graffiti picks up the surface instead of floating on it. */
const WALL_SURFACE_LAYER =
  'repeating-linear-gradient(135deg, rgba(14, 15, 45, 0.55) 0 3px, rgba(120, 150, 255, 0.06) 3px 9px)'

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
  min-height: initial;
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
