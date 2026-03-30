import type { CowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { sendCoinbaseConnectionFlowEvent } from './coinbaseConnectionFlow'

describe('coinbaseConnectionFlow', () => {
  it('sends a telemetry event with base payload', () => {
    const sendEvent = jest.fn()
    const analytics = { sendEvent } as unknown as CowAnalytics

    sendCoinbaseConnectionFlowEvent(analytics, {
      stage: 'switchStart',
      result: 'started',
      source: 'networkSelector',
      chainId: SupportedChainId.MAINNET,
      targetChainId: SupportedChainId.GNOSIS_CHAIN,
      isMobile: true,
      isCoinbaseWallet: true,
    })

    expect(sendEvent).toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        flowVersion: 'v1',
        stage: 'switchStart',
        result: 'started',
        source: 'networkSelector',
        chainId: SupportedChainId.MAINNET,
        targetChainId: SupportedChainId.GNOSIS_CHAIN,
        isMobile: true,
        isCoinbaseWallet: true,
      }),
    )
  })

  it('normalizes Error instances into errorName and errorMessage', () => {
    const sendEvent = jest.fn()
    const analytics = { sendEvent } as unknown as CowAnalytics
    const error = new Error('Boom')
    error.name = 'CustomError'

    sendCoinbaseConnectionFlowEvent(analytics, {
      stage: 'connectError',
      result: 'error',
      source: 'walletModal',
      isMobile: false,
      isCoinbaseWallet: true,
      error,
    })

    expect(sendEvent).toHaveBeenCalledWith(
      'coinbase_connection_flow',
      expect.objectContaining({
        errorName: 'CustomError',
        errorMessage: 'Boom',
      }),
    )
  })
})
