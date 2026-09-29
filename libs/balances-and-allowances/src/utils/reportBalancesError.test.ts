import { BaseError, HttpRequestError } from 'viem'

import { captureError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getRpcHttpErrorStatus, reportBalancesError } from './reportBalancesError'

jest.mock('@cowprotocol/common-utils', () => ({
  captureError: jest.fn(),
  createCowLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
  normalizeError: (err: unknown) => (err instanceof Error ? err : new Error(String(err))),
}))

const captureErrorMock = captureError as jest.Mock

function rateLimitError(): BaseError {
  const httpError = new HttpRequestError({ status: 429, url: 'https://rpc.example' })
  return new BaseError('multicall failed', { cause: httpError })
}

describe('getRpcHttpErrorStatus', () => {
  it('extracts the status from a wrapped HttpRequestError', () => {
    expect(getRpcHttpErrorStatus(rateLimitError())).toBe(429)
  })

  it('reads a plain numeric status property', () => {
    expect(getRpcHttpErrorStatus({ status: 503 })).toBe(503)
  })

  it('returns undefined for non-HTTP / JSON-RPC errors', () => {
    expect(getRpcHttpErrorStatus(new Error('header not found'))).toBeUndefined()
    expect(getRpcHttpErrorStatus(new BaseError('rpc error'))).toBeUndefined()
    expect(getRpcHttpErrorStatus(undefined)).toBeUndefined()
  })
})

describe('reportBalancesError', () => {
  beforeEach(() => {
    captureErrorMock.mockReset()
  })

  it('tags rate-limit (429) errors distinctly', () => {
    reportBalancesError({ error: rateLimitError(), chainId: SupportedChainId.MAINNET, tokensCount: 12 })

    expect(captureErrorMock).toHaveBeenCalledTimes(1)
    const [capturedError, , params, tags] = captureErrorMock.mock.calls[0]
    expect(capturedError.name).toBe('BalancesRateLimitError')
    expect(tags).toMatchObject({ errorType: 'BalancesRateLimitError', httpStatus: '429' })
    expect(params).toMatchObject({ chainId: SupportedChainId.MAINNET, tokensCount: 12, httpStatus: 429 })
  })

  it('tags non-429 errors as generic multicall errors without an httpStatus tag', () => {
    reportBalancesError({ error: new Error('boom'), chainId: SupportedChainId.GNOSIS_CHAIN, tokensCount: 1 })

    const [capturedError, , , tags] = captureErrorMock.mock.calls[0]
    expect(capturedError.name).toBe('BalancesMulticallError')
    expect(tags.errorType).toBe('BalancesMulticallError')
    expect(tags.httpStatus).toBeUndefined()
  })
})
