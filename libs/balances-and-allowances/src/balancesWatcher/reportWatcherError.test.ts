import { captureError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { reportWatcherError } from './reportWatcherError'
import { BalancesWatcherApiError, BalancesWatcherStreamError } from './types'

jest.mock('@cowprotocol/common-utils', () => ({
  captureError: jest.fn(),
  createCowLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}))

const captureErrorMock = captureError as jest.Mock

// The reporter keeps one shared throttle timestamp across all errors, so each
// test advances the mocked clock past the window to start unthrottled.
let mockedNow = 0

describe('reportWatcherError', () => {
  beforeEach(() => {
    captureErrorMock.mockReset()
    mockedNow += ms`61s`
    jest.spyOn(Date, 'now').mockImplementation(() => mockedNow)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('tags a 429 session error as a distinct rate-limit error', () => {
    const error = new BalancesWatcherApiError(429, { code: 429, message: 'Too many requests' })
    reportWatcherError({ error, phase: 'session', chainId: SupportedChainId.MAINNET })

    expect(captureErrorMock).toHaveBeenCalledTimes(1)
    const [capturedError, , params, tags] = captureErrorMock.mock.calls[0]
    expect(capturedError.name).toBe('BalancesWatcherRateLimitError')
    expect(tags).toMatchObject({
      scope: 'BalancesWatcher',
      errorType: 'BalancesWatcherRateLimitError',
      phase: 'session',
      httpStatus: '429',
      rateLimited: 'true',
    })
    expect(params).toMatchObject({ chainId: SupportedChainId.MAINNET, phase: 'session', httpStatus: 429, apiCode: 429 })
  })

  it('preserves the backend code for a non-429 session limit error', () => {
    const error = new BalancesWatcherApiError(400, { code: 4001, message: 'Token limit exceeded' })
    reportWatcherError({ error, phase: 'session', chainId: SupportedChainId.GNOSIS_CHAIN })

    const [capturedError, , params, tags] = captureErrorMock.mock.calls[0]
    expect(capturedError.name).toBe('BalancesWatcherSessionError')
    expect(tags).toMatchObject({ httpStatus: '400', phase: 'session' })
    expect(tags.rateLimited).toBeUndefined()
    expect(params).toMatchObject({ httpStatus: 400, apiCode: 4001 })
  })

  it('tags a terminal stream error with its code and no httpStatus', () => {
    const error = new BalancesWatcherStreamError({ code: 500, message: 'stream closed' })
    reportWatcherError({ error, phase: 'stream', chainId: SupportedChainId.ARBITRUM_ONE })

    const [capturedError, , params, tags] = captureErrorMock.mock.calls[0]
    expect(capturedError.name).toBe('BalancesWatcherStreamError')
    expect(tags.httpStatus).toBeUndefined()
    expect(tags.phase).toBe('stream')
    expect(params).toMatchObject({ apiCode: 500 })
  })

  it('tags a first-snapshot timeout distinctly', () => {
    reportWatcherError({
      error: new Error('No snapshot received'),
      phase: 'first-snapshot-timeout',
      chainId: SupportedChainId.BASE,
    })

    const [capturedError, , , tags] = captureErrorMock.mock.calls[0]
    expect(capturedError.name).toBe('BalancesWatcherSnapshotTimeout')
    expect(tags.phase).toBe('first-snapshot-timeout')
  })

  it('throttles any further report within the shared window, regardless of error kind', () => {
    reportWatcherError({
      error: new BalancesWatcherStreamError({ code: 503, message: 'unavailable' }),
      phase: 'stream',
      chainId: SupportedChainId.POLYGON,
    })
    // Different phase, chain, and error — still suppressed by the shared throttle.
    reportWatcherError({
      error: new BalancesWatcherApiError(429, { code: 429, message: 'Too many requests' }),
      phase: 'session',
      chainId: SupportedChainId.MAINNET,
    })

    expect(captureErrorMock).toHaveBeenCalledTimes(1)
  })

  it('reports again once the window has passed', () => {
    const error = new Error('boom')
    reportWatcherError({ error, phase: 'session', chainId: SupportedChainId.MAINNET })

    mockedNow += ms`61s`
    reportWatcherError({ error, phase: 'session', chainId: SupportedChainId.MAINNET })

    expect(captureErrorMock).toHaveBeenCalledTimes(2)
  })
})
