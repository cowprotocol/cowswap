import IMAGE_BACKGROUND_DARK_CHRISTMAS_MEDIUM from '@cowprotocol/assets/images/background-cowswap-christmas-dark-medium.svg'
import IMAGE_BACKGROUND_DARK_CHRISTMAS_SMALL from '@cowprotocol/assets/images/background-cowswap-christmas-dark-small.svg'
import IMAGE_BACKGROUND_DARK_CHRISTMAS from '@cowprotocol/assets/images/background-cowswap-christmas-dark.svg'
import IMAGE_BACKGROUND_LIGHT_CHRISTMAS_MEDIUM from '@cowprotocol/assets/images/background-cowswap-christmas-light-medium.svg'
import IMAGE_BACKGROUND_LIGHT_CHRISTMAS_SMALL from '@cowprotocol/assets/images/background-cowswap-christmas-light-small.svg'
import IMAGE_BACKGROUND_LIGHT_CHRISTMAS from '@cowprotocol/assets/images/background-cowswap-christmas-light.svg'
import IMAGE_BACKGROUND_DARK from '@cowprotocol/assets/images/background-cowswap-darkmode.svg'
import IMAGE_BACKGROUND_DARK_HALLOWEEN_MEDIUM from '@cowprotocol/assets/images/background-cowswap-halloween-dark-medium.svg'
import IMAGE_BACKGROUND_DARK_HALLOWEEN_SMALL from '@cowprotocol/assets/images/background-cowswap-halloween-dark-small.svg'
import IMAGE_BACKGROUND_DARK_HALLOWEEN from '@cowprotocol/assets/images/background-cowswap-halloween-dark.svg'
import IMAGE_BACKGROUND_LIGHT from '@cowprotocol/assets/images/background-cowswap-lightmode.svg'
import { CowSwapTheme, Media } from '@cowprotocol/ui'

import * as CSS from 'csstype'
import styled from 'styled-components/macro'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function isChristmasTheme(theme?: CowSwapTheme) {
  if (!theme) {
    return false
  }

  return ['darkChristmas', 'lightChristmas'].includes(theme)
}

export const AppWrapper = styled.div<Partial<CSS.Properties>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: ${({ theme }) => (theme.isInjectedWidgetMode ? '400px' : '100vh')};
  height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'initial' : '100%')};
`

export const Marginer = styled.div`
  margin-top: 5rem;
`

export const BodyWrapper = styled.div<{ customTheme?: CowSwapTheme }>`
  --marginBottomOffset: 65px;
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: flex-start;
  justify-content: center;
  flex: 1 1 auto;
  z-index: 2;
  color: inherit;
  padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '16px 16px 0' : '150px 16px 76px')};
  margin: ${({ theme }) => (theme.isInjectedWidgetMode ? '0' : '-76px auto calc(var(--marginBottomOffset) * -1);')};
  border-bottom-left-radius: ${({ theme }) => (theme.isInjectedWidgetMode ? '0' : 'var(--marginBottomOffset)')};
  border-bottom-right-radius: ${({ theme }) => (theme.isInjectedWidgetMode ? '0' : 'var(--marginBottomOffset)')};
  min-height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'initial' : 'calc(100vh - 200px)')};
  background: ${({ theme, customTheme }) => {
    if (theme.isInjectedWidgetMode) {
      return 'transparent'
    } else {
      const backgroundColor = theme.darkMode ? '#0E0F2D' : '#65D9FF'
      let backgroundImage

      if (customTheme === 'darkHalloween') {
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
    padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '0 0 16px' : '150px 16px 76px')};
    flex: none;
    min-height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'initial' : 'calc(100vh - 200px)')};
    background-size: auto;

    ${({ customTheme }) =>
      customTheme === 'darkHalloween' &&
      `
        background-image: url(${IMAGE_BACKGROUND_DARK_HALLOWEEN_MEDIUM});
      `}

    ${({ customTheme, theme }) =>
      isChristmasTheme(customTheme) &&
      !theme.isInjectedWidgetMode &&
      `
        background-image: url(${theme.darkMode ? IMAGE_BACKGROUND_DARK_CHRISTMAS_MEDIUM : IMAGE_BACKGROUND_LIGHT_CHRISTMAS_MEDIUM});
      `}
  }

  ${Media.upToSmall()} {
    padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '0 0 16px' : '90px 16px 76px')};
    min-height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'initial' : 'calc(100vh - 100px)')};

    ${({ customTheme }) =>
      customTheme === 'darkHalloween' &&
      `
        background-image: url(${IMAGE_BACKGROUND_DARK_HALLOWEEN_SMALL});
      `}

    ${({ customTheme, theme }) =>
      isChristmasTheme(customTheme) &&
      !theme.isInjectedWidgetMode &&
      `
        background-image: url(${theme.darkMode ? IMAGE_BACKGROUND_DARK_CHRISTMAS_SMALL : IMAGE_BACKGROUND_LIGHT_CHRISTMAS_SMALL});
      `}
  }
`
