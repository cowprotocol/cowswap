import { renderHook } from '@testing-library/react'

import { useFreezeWhileConfirming } from './useFreezeWhileConfirming'
import { useTradeConfirmState } from './useTradeConfirmState'

jest.mock('./useTradeConfirmState', () => ({
  useTradeConfirmState: jest.fn(),
}))

const mockedUseTradeConfirmState = useTradeConfirmState as jest.MockedFunction<typeof useTradeConfirmState>

function mockIsConfirming(isConfirming: boolean): void {
  mockedUseTradeConfirmState.mockReturnValue({
    isOpen: true,
    pendingTrade: null,
    transactionHash: null,
    error: null,
    permitSignatureState: undefined,
    forcePriceConfirmation: false,
    isConfirming,
  } as ReturnType<typeof useTradeConfirmState>)
}

describe('useFreezeWhileConfirming', () => {
  it('tracks live updates while not confirming', () => {
    mockIsConfirming(false)
    const { result, rerender } = renderHook(({ value }) => useFreezeWhileConfirming(value), {
      initialProps: { value: 1 },
    })

    expect(result.current).toBe(1)

    rerender({ value: 2 })
    expect(result.current).toBe(2)
  })

  it('freezes the last value seen before confirming started, ignoring later updates', () => {
    mockIsConfirming(false)
    const { result, rerender } = renderHook(({ value }) => useFreezeWhileConfirming(value), {
      initialProps: { value: 'expected-100' },
    })

    expect(result.current).toBe('expected-100')

    mockIsConfirming(true)
    rerender({ value: 'expected-100' })
    expect(result.current).toBe('expected-100')

    // A quote refresh lands while the wallet prompt is open - the frozen value must not change.
    rerender({ value: 'expected-105' })
    expect(result.current).toBe('expected-100')

    rerender({ value: 'expected-110' })
    expect(result.current).toBe('expected-100')
  })

  it('resumes tracking live updates once confirming is reset back to false', () => {
    mockIsConfirming(false)
    const { result, rerender } = renderHook(({ value }) => useFreezeWhileConfirming(value), {
      initialProps: { value: 'a' },
    })

    mockIsConfirming(true)
    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    // Confirm attempt aborted (e.g. user declined price-impact confirmation) - back to live.
    mockIsConfirming(false)
    rerender({ value: 'c' })
    expect(result.current).toBe('c')
  })
})
