import { isRejectRequestProviderError } from './misc'

describe('isRejectRequestProviderError', () => {
  it('detects the standard EIP-1193 rejection code', () => {
    expect(isRejectRequestProviderError({ code: 4001 })).toBe(true)
  })

  it('detects wallet-specific rejection messages', () => {
    expect(isRejectRequestProviderError({ message: 'User rejected the request' })).toBe(true)
    expect(isRejectRequestProviderError('MetaMask Tx Signature: User denied transaction signature')).toBe(true)
  })

  it('detects a rejection wrapped in error.cause (viem/Safe/WalletConnect)', () => {
    // viem surfaces "An unknown RPC error occurred." on the outer error and keeps the real
    // 4001 rejection on error.cause — the exact shape reported in #7774.
    const wrappedByCode = {
      shortMessage: 'An unknown RPC error occurred.',
      cause: { code: 4001, message: 'User rejected the request' },
    }
    expect(isRejectRequestProviderError(wrappedByCode)).toBe(true)

    const wrappedByMessage = {
      shortMessage: 'An unknown RPC error occurred.',
      cause: { cause: { message: 'User rejected the request' } },
    }
    expect(isRejectRequestProviderError(wrappedByMessage)).toBe(true)
  })

  it('returns false for non-rejection errors', () => {
    expect(isRejectRequestProviderError({ code: -32000, message: 'intrinsic gas too low' })).toBe(false)
    expect(isRejectRequestProviderError(undefined)).toBe(false)
    expect(isRejectRequestProviderError(null)).toBe(false)
  })

  it('does not loop forever on a cyclic cause chain', () => {
    const cyclic: { message: string; cause?: unknown } = { message: 'boom' }
    cyclic.cause = cyclic
    expect(isRejectRequestProviderError(cyclic)).toBe(false)
  })
})
