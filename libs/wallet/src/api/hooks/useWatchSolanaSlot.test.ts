import { act, renderHook } from '@testing-library/react'

import { useWatchSolanaSlot } from './useWatchSolanaSlot'

let mockConnection: MockConnection | undefined

jest.mock('@reown/appkit-adapter-solana/react', () => ({
  useAppKitConnection: () => ({ connection: mockConnection }),
}))

interface MockConnection {
  getSlot: jest.Mock<Promise<number>, []>
  onSlotChange: jest.Mock<number, [(info: { slot: number }) => void]>
  removeSlotChangeListener: jest.Mock<void, [number]>
  emitSlot: (slot: number) => void
}

function createConnection(initialSlot = 100): MockConnection {
  let listener: ((info: { slot: number }) => void) | undefined
  return {
    getSlot: jest.fn().mockResolvedValue(initialSlot),
    onSlotChange: jest.fn((cb) => {
      listener = cb
      return 1
    }),
    removeSlotChangeListener: jest.fn(),
    emitSlot: (slot: number) => listener?.({ slot }),
  }
}

// Flush the microtask queue so the async `getSlot` seed resolves.
async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('useWatchSolanaSlot', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockConnection = createConnection()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('subscribes to slot changes and seeds the current slot when enabled', async () => {
    const onSlot = jest.fn()
    renderHook(() => useWatchSolanaSlot({ enabled: true, onSlot }))

    expect(mockConnection?.onSlotChange).toHaveBeenCalledTimes(1)
    await flushMicrotasks()
    expect(onSlot).toHaveBeenCalledWith(100n)
  })

  it('throttles bursts of slot updates to at most once per 5s, emitting the latest slot', async () => {
    const onSlot = jest.fn()
    renderHook(() => useWatchSolanaSlot({ enabled: true, onSlot }))
    await flushMicrotasks() // seed (leading edge)
    onSlot.mockClear()

    act(() => {
      mockConnection?.emitSlot(101)
      mockConnection?.emitSlot(102)
      mockConnection?.emitSlot(103)
    })

    // Still within the 5s window after the seed — nothing emitted yet.
    expect(onSlot).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(onSlot).toHaveBeenCalledTimes(1)
    expect(onSlot).toHaveBeenCalledWith(103n)
  })

  it('emits immediately once the 5s window has elapsed since the last update', async () => {
    const onSlot = jest.fn()
    renderHook(() => useWatchSolanaSlot({ enabled: true, onSlot }))
    await flushMicrotasks() // seed at t0
    onSlot.mockClear()

    act(() => {
      jest.advanceTimersByTime(5000)
    })
    act(() => {
      mockConnection?.emitSlot(200)
    })

    expect(onSlot).toHaveBeenCalledWith(200n)
  })

  it('forwards slots to onSlot as a bigint', () => {
    const onSlot = jest.fn()
    renderHook(() => useWatchSolanaSlot({ enabled: true, onSlot }))

    act(() => {
      mockConnection?.emitSlot(123)
    })

    expect(onSlot).toHaveBeenCalledWith(123n)
  })

  it('does not subscribe when disabled', () => {
    const onSlot = jest.fn()
    renderHook(() => useWatchSolanaSlot({ enabled: false, onSlot }))

    expect(mockConnection?.onSlotChange).not.toHaveBeenCalled()
  })

  it('does not subscribe when there is no connection', () => {
    mockConnection = undefined
    const onSlot = jest.fn()

    expect(() => renderHook(() => useWatchSolanaSlot({ enabled: true, onSlot }))).not.toThrow()
  })

  it('removes the slot listener on unmount', () => {
    const onSlot = jest.fn()
    const { unmount } = renderHook(() => useWatchSolanaSlot({ enabled: true, onSlot }))

    unmount()

    expect(mockConnection?.removeSlotChangeListener).toHaveBeenCalledWith(1)
  })

  it('re-subscribes when the connection instance changes', () => {
    const onSlot = jest.fn()
    const first = mockConnection as MockConnection
    const { rerender } = renderHook(() => useWatchSolanaSlot({ enabled: true, onSlot }))

    expect(first.onSlotChange).toHaveBeenCalledTimes(1)

    const second = createConnection(200)
    mockConnection = second
    rerender()

    expect(first.removeSlotChangeListener).toHaveBeenCalledWith(1)
    expect(second.onSlotChange).toHaveBeenCalledTimes(1)
  })

  it('does not emit a pending throttled slot after the watcher is disabled', async () => {
    const onSlot = jest.fn()
    const { rerender } = renderHook(({ enabled }) => useWatchSolanaSlot({ enabled, onSlot }), {
      initialProps: { enabled: true },
    })
    await flushMicrotasks() // seed (leading edge) at t0
    onSlot.mockClear()

    // A new slot arrives but is throttled — a trailing emit is scheduled for t0 + 5s.
    act(() => {
      mockConnection?.emitSlot(101)
    })
    expect(onSlot).not.toHaveBeenCalled()

    // The user switches away from Solana before the trailing timeout fires.
    rerender({ enabled: false })

    // The throttle window elapses; the stale slot must not reach onSlot.
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(onSlot).not.toHaveBeenCalled()
  })

  it('does not resubscribe when only the callback identity changes', () => {
    const { rerender } = renderHook(
      (initialProps) =>
        useWatchSolanaSlot({ enabled: true, onSlot: (initialProps as { cb: (slot: bigint) => void }).cb }),
      {
        initialProps: { cb: jest.fn() },
      },
    )

    rerender({ cb: jest.fn() })

    expect(mockConnection?.onSlotChange).toHaveBeenCalledTimes(1)
  })
})
