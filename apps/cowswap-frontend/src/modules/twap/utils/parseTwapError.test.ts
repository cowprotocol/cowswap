import { getErrorMessage } from './parseTwapError'

describe('getErrorMessage()', () => {
  it('maps nested WalletConnect "Request expired" to a friendly message', () => {
    const inner = new Error('Request expired. Please try again.')
    const outer = new Error('TransactionExecutionError: An unknown RPC error occurred.')
    ;(outer as Error & { cause?: unknown }).cause = inner

    const message = getErrorMessage(outer)

    expect(message).toContain('timed out')
    expect(message).not.toContain('TransactionExecutionError')
  })

  it('returns INVALID_ARGUMENT helper when present in flattened message', () => {
    const err = new Error('INVALID_ARGUMENT: argument="foo"')
    expect(getErrorMessage(err)).toContain('Invalid argument')
  })

  it('falls back to default when error is empty', () => {
    expect(getErrorMessage(null)).toContain('Something went wrong')
  })
})
