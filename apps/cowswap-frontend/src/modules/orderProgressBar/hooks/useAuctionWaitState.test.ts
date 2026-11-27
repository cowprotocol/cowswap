import { act, renderHook } from '@testing-library/react'

import { Order } from 'legacy/state/orders/actions'

import { useAuctionWaitState } from './useAuctionWaitState'

const NOW_MS = 1_700_000_000_000

function order(validFrom: number): Order {
  return { waitAndSaveNextBatch: validFrom } as Order
}

describe('useAuctionWaitState', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(NOW_MS)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('clears the wait when validFrom passes without a mounted countdown', () => {
    const validFrom = NOW_MS / 1000 + 30
    const { result } = renderHook(() => useAuctionWaitState(order(validFrom)))

    expect(result.current.isAuctionWaiting).toBe(true)
    expect(result.current.auctionValidFrom).toBe(validFrom)

    act(() => {
      jest.advanceTimersByTime(30_000)
    })

    expect(result.current.isAuctionWaiting).toBe(false)
    expect(result.current.auctionValidFrom).toBeUndefined()
  })

  it('keeps waiting until validFrom', () => {
    const validFrom = NOW_MS / 1000 + 30
    const { result } = renderHook(() => useAuctionWaitState(order(validFrom)))

    act(() => {
      jest.advanceTimersByTime(10_000)
    })

    expect(result.current.isAuctionWaiting).toBe(true)
    expect(result.current.auctionValidFrom).toBe(validFrom)
  })
})
