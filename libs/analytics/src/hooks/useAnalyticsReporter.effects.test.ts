import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AnalyticsContext, CowAnalytics } from '../CowAnalytics'
import { PixelAnalytics, PixelEvent } from '../pixels/PixelAnalytics'

jest.mock('react', () => {
  const actual = jest.requireActual('react') as typeof import('react')

  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      effect()
    },
  }
})

const { useChainSwitchAnalytics, useUserContext } =
  require('./useAnalyticsReporter.effects') as typeof import('./useAnalyticsReporter.effects')

function createAnalyticsMock(): CowAnalytics {
  return {
    sendEvent: jest.fn(),
    sendPageView: jest.fn(),
    sendTiming: jest.fn(),
    sendError: jest.fn(),
    outboundLink: jest.fn(),
    setContext: jest.fn(),
    setUserAccount: jest.fn(),
  }
}

describe('useAnalyticsReporter effects', () => {
  describe('useChainSwitchAnalytics', () => {
    it('sends chain_switched when same wallet changes chain', () => {
      const cowAnalytics = createAnalyticsMock()

      useChainSwitchAnalytics({
        account: '0x1111111111111111111111111111111111111111',
        prevAccount: '0x1111111111111111111111111111111111111111',
        chainId: SupportedChainId.BASE,
        prevChainId: SupportedChainId.MAINNET,
        cowAnalytics,
      })

      expect(cowAnalytics.sendEvent).toHaveBeenCalledWith({
        category: 'Wallet',
        action: 'chain_switched',
        previousChainId: '1',
        newChainId: '8453',
      })
    })

    it('does not send chain_switched when no wallet account is connected', () => {
      const cowAnalytics = createAnalyticsMock()

      useChainSwitchAnalytics({
        account: undefined,
        prevAccount: undefined,
        chainId: SupportedChainId.BASE,
        prevChainId: SupportedChainId.MAINNET,
        cowAnalytics,
      })

      expect(cowAnalytics.sendEvent).not.toHaveBeenCalled()
    })
  })

  describe('useUserContext', () => {
    it('sets not-connected wallet context when account is missing', () => {
      const cowAnalytics = createAnalyticsMock()

      useUserContext({
        account: undefined,
        walletName: undefined,
        prevAccount: undefined,
        cowAnalytics,
      })

      expect(cowAnalytics.setUserAccount).toHaveBeenCalledWith(undefined, 'Not connected')
      expect(cowAnalytics.setContext).toHaveBeenCalledWith(AnalyticsContext.walletName, 'Not connected')
    })

    it('sends connect-wallet pixels only for first wallet connection', () => {
      const cowAnalytics = createAnalyticsMock()
      const pixelAnalytics = {
        sendAllPixels: jest.fn(),
      } as unknown as PixelAnalytics

      useUserContext({
        account: undefined,
        walletName: 'Rainbow',
        prevAccount: undefined,
        pixelAnalytics,
        cowAnalytics,
      })

      useUserContext({
        account: '0x1111111111111111111111111111111111111111',
        walletName: 'Rainbow',
        prevAccount: undefined,
        pixelAnalytics,
        cowAnalytics,
      })

      useUserContext({
        account: '0x1111111111111111111111111111111111111111',
        walletName: 'Rainbow',
        prevAccount: '0x1111111111111111111111111111111111111111',
        pixelAnalytics,
        cowAnalytics,
      })

      expect(pixelAnalytics.sendAllPixels).toHaveBeenCalledTimes(1)
      expect(pixelAnalytics.sendAllPixels).toHaveBeenCalledWith(PixelEvent.CONNECT_WALLET)
    })
  })
})
