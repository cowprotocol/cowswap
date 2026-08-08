import { debounce, isRejectRequestProviderError, TimeoutError, withTimeout } from './misc'

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('forwards the original arguments to the wrapped function', () => {
    const func = jest.fn()
    const debounced = debounce(func, 100)

    debounced('/swap?chain=mainnet', ['param'], 'CoW Swap')
    jest.advanceTimersByTime(100)

    // Regression: the wrapped function used to receive a single array argument
    // (['/swap?chain=mainnet', ['param'], 'CoW Swap']) instead of the original arguments
    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith('/swap?chain=mainnet', ['param'], 'CoW Swap')
  })

  it('invokes the wrapped function only once with the latest arguments', () => {
    const func = jest.fn()
    const debounced = debounce(func, 100)

    debounced('first')
    jest.advanceTimersByTime(50)
    debounced('second')
    jest.advanceTimersByTime(100)

    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith('second')
  })

  it('does not invoke the wrapped function before the wait time elapses', () => {
    const func = jest.fn()
    const debounced = debounce(func, 100)

    debounced()
    jest.advanceTimersByTime(99)

    expect(func).not.toHaveBeenCalled()
  })
})

describe('withTimeout', () => {
  it('resolves when the promise settles before the timeout', async () => {
    await expect(withTimeout(Promise.resolve('ok'), { timeout: 1000, timeoutMessage: 'Timed out' })).resolves.toBe('ok')
  })

  it('rejects with TimeoutError when the promise times out', async () => {
    await expect(
      withTimeout(new Promise(() => undefined), { timeout: 50, timeoutMessage: 'Timed out' }),
    ).rejects.toThrow(TimeoutError)
  })

  it('rejects with the provided timeout message', async () => {
    await expect(
      withTimeout(new Promise(() => undefined), {
        timeout: 50,
        timeoutMessage: 'Timed out',
      }),
    ).rejects.toThrow('Timed out')
  })
})

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
