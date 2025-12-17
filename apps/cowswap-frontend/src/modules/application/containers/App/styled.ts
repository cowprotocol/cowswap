import IMAGE_BACKGROUND_DARK_CHRISTMAS_MEDIUM from '@cowprotocol/assets/images/background-cowswap-christmas-dark-medium.svg'
import IMAGE_BACKGROUND_DARK_CHRISTMAS_SMALL from '@cowprotocol/assets/images/background-cowswap-christmas-dark-small.svg'
import IMAGE_BACKGROUND_DARK_CHRISTMAS from '@cowprotocol/assets/images/background-cowswap-christmas-dark.svg'
import IMAGE_BACKGROUND_LIGHT_CHRISTMAS_MEDIUM from '@cowprotocol/assets/images/background-cowswap-christmas-light-medium.svg'
import IMAGE_BACKGROUND_LIGHT_CHRISTMAS_SMALL from '@cowprotocol/assets/images/background-cowswap-christmas-light-small.svg'
import IMAGE_BACKGROUND_LIGHT_CHRISTMAS from '@cowprotocol/assets/images/background-cowswap-christmas-light.svg'
import IMAGE_BACKGROUND_DARK_NO_COWS from '@cowprotocol/assets/images/background-cowswap-darkmode-nocows.svg'
import IMAGE_BACKGROUND_DARK from '@cowprotocol/assets/images/background-cowswap-darkmode.svg'
import IMAGE_BACKGROUND_DARK_HALLOWEEN_MEDIUM from '@cowprotocol/assets/images/background-cowswap-halloween-dark-medium.svg'
import IMAGE_BACKGROUND_DARK_HALLOWEEN from '@cowprotocol/assets/images/background-cowswap-halloween-dark.svg'
import IMAGE_BACKGROUND_LIGHT_NO_COWS from '@cowprotocol/assets/images/background-cowswap-lightmode-nocows.svg'
import IMAGE_BACKGROUND_LIGHT from '@cowprotocol/assets/images/background-cowswap-lightmode.svg'
import { CowSwapTheme, Media, UI } from '@cowprotocol/ui'

import * as CSS from 'csstype'
import styled from 'styled-components/macro'

import type { PageBackgroundVariant } from '../../contexts/PageBackgroundContext'

export function isChristmasTheme(theme?: CowSwapTheme): boolean {
  if (!theme) {
    return false
  }

  return ['darkChristmas', 'lightChristmas'].includes(theme)
}

export const AppWrapper = styled.div<Partial<CSS.Properties>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: ${({ theme }) => (theme.isWidget ? '400px' : '100vh')};
  height: ${({ theme }) => (theme.isWidget ? 'initial' : '100%')};
  position: relative;
`

export const Marginer = styled.div`
  margin-top: 5rem;
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

export const BodyWrapper = styled.div<{ customTheme?: CowSwapTheme; backgroundVariant?: PageBackgroundVariant }>`
  --marginBottomOffset: 65px;
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: flex-start;
  justify-content: center;
  flex: 1 1 auto;
  z-index: 2;
  color: inherit;
  padding: ${({ theme }) => (theme.isWidget ? '16px 16px 0' : '150px 16px 176px')};
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
          ? `url(${IMAGE_BACKGROUND_DARK_NO_COWS})`
          : `url(${IMAGE_BACKGROUND_LIGHT_NO_COWS})`
      } else if (customTheme === 'darkHalloween') {
        backgroundImage = `url(${IMAGE_BACKGROUND_DARK_HALLOWEEN})`
      } else if (isChristmasTheme(customTheme)) {
        backgroundImage = theme.darkMode
          ? `url(${IMAGE_BACKGROUND_DARK_CHRISTMAS})`
          : `url(${IMAGE_BACKGROUND_LIGHT_CHRISTMAS})`
      } else {
        backgroundImage = theme.darkMode ? `url(${IMAGE_BACKGROUND_DARK})` : `url(${IMAGE_BACKGROUND_LIGHT})`
      }

      return `${backgroundColor} ${backgroundImage} no-repeat bottom -1px center / contain`
    }
  }};

  ${Media.upToMedium()} {
    padding: ${({ theme }) => (theme.isWidget ? '0 0 16px' : '150px 16px 150px')};
    flex: none;
    min-height: ${({ theme }) => (theme.isWidget ? 'initial' : 'calc(100vh - 200px)')};
    background-size: ${({ customTheme }) =>
      customTheme === 'darkHalloween' || isChristmasTheme(customTheme) ? 'contain' : 'auto'};

    ${({ customTheme, backgroundVariant, theme }) =>
      backgroundVariant !== 'nocows' &&
      customTheme === 'darkHalloween' &&
      !theme.isWidget &&
      `
        background-image: url(${IMAGE_BACKGROUND_DARK_HALLOWEEN_MEDIUM});
      `}

    ${({ customTheme, theme, backgroundVariant }) =>
      backgroundVariant !== 'nocows' &&
      isChristmasTheme(customTheme) &&
      !theme.isWidget &&
      `
        background-image: url(${theme.darkMode ? IMAGE_BACKGROUND_DARK_CHRISTMAS_MEDIUM : IMAGE_BACKGROUND_LIGHT_CHRISTMAS_MEDIUM});
      `}
  }

  ${Media.upToSmall()} {
    padding: ${({ theme }) => (theme.isWidget ? '0 0 16px' : '90px 16px 200px')};
    min-height: ${({ theme }) => (theme.isWidget ? 'initial' : 'calc(100vh - 100px)')};
    background-size: ${({ customTheme }) =>
      customTheme === 'darkHalloween' || isChristmasTheme(customTheme) ? 'contain' : 'auto'};

    ${({ customTheme, backgroundVariant, theme }) =>
      backgroundVariant !== 'nocows' &&
      customTheme === 'darkHalloween' &&
      !theme.isWidget &&
      `
        background-image: url(${IMAGE_BACKGROUND_DARK_HALLOWEEN_MEDIUM});
      `}

    ${({ customTheme, theme, backgroundVariant }) =>
      backgroundVariant !== 'nocows' &&
      isChristmasTheme(customTheme) &&
      !theme.isWidget &&
      `
        background-image: url(${theme.darkMode ? IMAGE_BACKGROUND_DARK_CHRISTMAS_SMALL : IMAGE_BACKGROUND_LIGHT_CHRISTMAS_SMALL});
      `}
  }
`
