import { act, renderHook } from '@testing-library/react'

import { useAllTransactionHashes } from 'legacy/state/enhancedTransactions/hooks'

import { useConfirmedTransactionsTrigger } from './useConfirmedTransactionsTrigger'

jest.mock('legacy/state/enhancedTransactions/hooks', () => ({ useAllTransactionHashes: jest.fn() }))

const mockUseAllTransactionHashes = useAllTransactionHashes as jest.MockedFunction<typeof useAllTransactionHashes>

// The hook debounces, so every assertion has to run the timers the debounce is waiting on.
function settle(): void {
  act(() => {
    jest.runAllTimers()
  })
}

describe('useConfirmedTransactionsTrigger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('does not fire while nothing confirms', () => {
    mockUseAllTransactionHashes.mockReturnValue([])

    const { result, rerender } = renderHook(() => useConfirmedTransactionsTrigger())
    settle()
    const initial = result.current

    rerender()
    settle()

    expect(result.current).toBe(initial)
  })

  // FE-929: a Solana order's approval rides in the transaction that creates it, so the pre-placement
  // snapshot is stale the moment that transaction lands and has to be re-read.
  it('fires when a transaction confirms', () => {
    mockUseAllTransactionHashes.mockReturnValue([])

    const { result, rerender } = renderHook(() => useConfirmedTransactionsTrigger())
    settle()
    const before = result.current

    mockUseAllTransactionHashes.mockReturnValue(['0xabc'])
    rerender()
    settle()

    expect(result.current).not.toBe(before)
  })

  it('fires again for each further confirmation', () => {
    mockUseAllTransactionHashes.mockReturnValue(['0xabc'])

    const { result, rerender } = renderHook(() => useConfirmedTransactionsTrigger())
    settle()
    const afterFirst = result.current

    mockUseAllTransactionHashes.mockReturnValue(['0xabc', '0xdef'])
    rerender()
    settle()

    expect(result.current).not.toBe(afterFirst)
  })

  // Clearing history drops the count without anything new landing; the value must still move on, so a
  // later confirmation cannot land on a number the query key has already seen.
  it('keeps moving when the confirmed count drops', () => {
    mockUseAllTransactionHashes.mockReturnValue(['0xabc', '0xdef'])

    const { result, rerender } = renderHook(() => useConfirmedTransactionsTrigger())
    settle()
    const beforeClear = result.current

    mockUseAllTransactionHashes.mockReturnValue([])
    rerender()
    settle()

    expect(result.current).toBeGreaterThan(beforeClear)
  })
})
