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

  it('collapses viem-wrapped user rejection (nested cause) to a short message', () => {
    const inner = new Error('User rejected the request. Details: User rejected transaction Version: viem@2.47.1')
    ;(inner as Error & { code?: number }).code = 4001
    const outer = new Error(
      'User rejected the request. Request Arguments: chain: undefined (id: 8453) from: 0x8FAb71C0d4272698A3B2d1F3Ed5FC3c1B9b3E531 Details: User rejected transaction Version: viem@2.47.1',
    )
    ;(outer as Error & { cause?: unknown }).cause = inner

    expect(getErrorMessage(outer)).toBe('User rejected transaction')
  })

  it('collapses top-level user rejection error to a short message', () => {
    const err = new Error('User denied transaction signature')
    ;(err as Error & { code?: number }).code = 4001

    expect(getErrorMessage(err)).toBe('User rejected transaction')
  })
})
