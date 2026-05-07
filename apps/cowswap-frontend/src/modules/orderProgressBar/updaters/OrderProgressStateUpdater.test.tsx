import type { PrimitiveAtom } from 'jotai'

import { OrderClass } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { act, render } from '@testing-library/react'
import { useSurplusQueueOrderIds } from 'entities/surplusModal'

import type { Order } from 'legacy/state/orders/actions'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { usePendingOrdersFillability } from 'modules/ordersTable'
import { useTradeConfirmState } from 'modules/trade'

import { OrderProgressStateUpdater } from './OrderProgressStateUpdater'

import { useOrderProgressBarPropsWithFillability } from '../hooks/useOrderProgressBarProps'
import { OrderProgressBarStepName } from '../types'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('legacy/state/orders/hooks', () => ({
  useOnlyPendingOrders: jest.fn(),
}))

jest.mock('modules/ordersTable', () => ({
  usePendingOrdersFillability: jest.fn(),
}))

jest.mock('../hooks/useOrderProgressBarProps', () => ({
  useOrderProgressBarPropsWithFillability: jest.fn(),
}))

jest.mock('entities/surplusModal', () => ({
  useSurplusQueueOrderIds: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useTradeConfirmState: jest.fn(),
}))

const mockPruneOrders = jest.fn()
const mockCancellationIds = jest.fn()
const progressStateSubscribers = new Set<() => void>()
let currentOrdersProgressState: Record<string, unknown> = {}

function setOrdersProgressState(nextState: Record<string, unknown>, notify = true): void {
  currentOrdersProgressState = nextState
  if (!notify) {
    return
  }
  progressStateSubscribers.forEach((listener) => listener())
}

const mockStore = {
  get: jest.fn((atom: PrimitiveAtom<unknown>) => {
    const { ordersProgressBarStateAtom } = jest.requireActual('../state/atoms')
    if (atom === ordersProgressBarStateAtom) {
      return currentOrdersProgressState
    }
    return undefined
  }),
  set: jest.fn((atom: PrimitiveAtom<unknown>, trackedOrderIds: string[]) => {
    const { pruneOrdersProgressBarState } = jest.requireActual('../state/atoms')
    if (atom === pruneOrdersProgressBarState) {
      mockPruneOrders(trackedOrderIds)
      setOrdersProgressState(
        Object.fromEntries(
          Object.entries(currentOrdersProgressState).filter(([orderId]) => trackedOrderIds.includes(orderId)),
        ),
        false,
      )
    }
  }),
  sub: jest.fn((atom: PrimitiveAtom<unknown>, listener: () => void) => {
    const { ordersProgressBarStateAtom } = jest.requireActual('../state/atoms')
    if (atom === ordersProgressBarStateAtom) {
      progressStateSubscribers.add(listener)
      return () => progressStateSubscribers.delete(listener)
    }
    return () => undefined
  }),
}

jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai')
  return {
    ...actual,
    useStore: jest.fn(() => mockStore),
    useAtomValue: jest.fn((atom: PrimitiveAtom<unknown>) => {
      const { cancellationTrackedOrderIdsAtom } = jest.requireActual('../state/atoms')
      if (atom === cancellationTrackedOrderIdsAtom) {
        return mockCancellationIds()
      }
      return actual.useAtomValue(atom)
    }),
  }
})

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useOnlyPendingOrdersMock = useOnlyPendingOrders as jest.MockedFunction<typeof useOnlyPendingOrders>
const usePendingOrdersFillabilityMock = usePendingOrdersFillability as jest.MockedFunction<
  typeof usePendingOrdersFillability
>
const useOrderProgressBarPropsMock = useOrderProgressBarPropsWithFillability as jest.MockedFunction<
  typeof useOrderProgressBarPropsWithFillability
>
const useSurplusQueueOrderIdsMock = useSurplusQueueOrderIds as jest.MockedFunction<typeof useSurplusQueueOrderIds>
const useTradeConfirmStateMock = useTradeConfirmState as jest.MockedFunction<typeof useTradeConfirmState>

type WalletInfo = ReturnType<typeof useWalletInfo>

const stubOrder = (overrides: Partial<Order>): Order => overrides as Order

describe('OrderProgressStateUpdater', () => {
  beforeEach(() => {
    useOrderProgressBarPropsMock.mockReturnValue({ props: {} as never, activityDerivedState: null })
    usePendingOrdersFillabilityMock.mockReturnValue({})
    useSurplusQueueOrderIdsMock.mockReturnValue([])
    useTradeConfirmStateMock.mockReturnValue({ transactionHash: null } as never)
    mockCancellationIds.mockReturnValue([])
    setOrdersProgressState({}, false)
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockPruneOrders.mockReset()
    progressStateSubscribers.clear()
    jest.useRealTimers()
  })

  it('subscribes to pending market orders even when the progress bar UI is not mounted', () => {
    useWalletInfoMock.mockReturnValue({ chainId: 1, account: '0xabc' } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([
      stubOrder({ id: '1', class: OrderClass.MARKET }),
      stubOrder({ id: '2', class: OrderClass.LIMIT }),
      stubOrder({ id: '3', class: OrderClass.MARKET }),
    ])
    render(<OrderProgressStateUpdater />)
    expect(usePendingOrdersFillabilityMock).toHaveBeenCalledTimes(1)
    expect(usePendingOrdersFillabilityMock).toHaveBeenCalledWith(OrderClass.MARKET)
    expect(useOrderProgressBarPropsMock).toHaveBeenCalledTimes(2)
    expect(useOrderProgressBarPropsMock).toHaveBeenNthCalledWith(1, 1, expect.objectContaining({ id: '1' }), undefined)
    expect(useOrderProgressBarPropsMock).toHaveBeenNthCalledWith(2, 1, expect.objectContaining({ id: '3' }), undefined)
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['1', '3'])
  })

  it('does nothing when wallet information is missing', () => {
    useWalletInfoMock.mockReturnValue({ chainId: undefined, account: undefined } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([])
    render(<OrderProgressStateUpdater />)
    expect(useOrderProgressBarPropsMock).not.toHaveBeenCalled()
    expect(mockPruneOrders).toHaveBeenLastCalledWith([])
  })

  it('keeps state for orders queued for the surplus modal', () => {
    useWalletInfoMock.mockReturnValue({ chainId: undefined, account: undefined } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([])
    useSurplusQueueOrderIdsMock.mockReturnValue(['queued-order', 'next-order'])
    render(<OrderProgressStateUpdater />)
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['queued-order', 'next-order'])
  })

  it('keeps state for the order currently displayed in the confirmation modal', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: undefined,
      account: undefined,
    } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([])
    useTradeConfirmStateMock.mockReturnValue({ transactionHash: '0xorder' } as never)
    render(<OrderProgressStateUpdater />)
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['0xorder'])
  })

  it('tracks the union of pending, queued, and displayed orders without duplicates', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: 1,
      account: '0xabc',
    } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([
      stubOrder({ id: '1', class: OrderClass.MARKET }),
      stubOrder({ id: '2', class: OrderClass.MARKET }),
    ])
    useSurplusQueueOrderIdsMock.mockReturnValue(['2', '3'])
    useTradeConfirmStateMock.mockReturnValue({ transactionHash: '2' } as never)
    render(<OrderProgressStateUpdater />)
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['1', '2', '3'])
  })

  it('keeps cancellation-triggered orders even if they are not pending anymore', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: undefined,
      account: undefined,
    } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([])
    mockCancellationIds.mockReturnValue(['abc'])
    render(<OrderProgressStateUpdater />)
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['abc'])
  })

  it('keeps recently untracked order state long enough for the completion sequence to finish', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-04-08T12:00:00Z'))

    useWalletInfoMock.mockReturnValue({
      chainId: 1,
      account: '0xabc',
    } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([stubOrder({ id: '1', class: OrderClass.MARKET })])
    setOrdersProgressState({ '1': { progressBarStepName: OrderProgressBarStepName.DELAYED } }, false)
    const { rerender } = render(<OrderProgressStateUpdater />)
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['1'])
    useOnlyPendingOrdersMock.mockReturnValue([])
    rerender(<OrderProgressStateUpdater />)
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['1'])
    act(() => {
      jest.advanceTimersByTime(10_000)
    })
    expect(mockPruneOrders).toHaveBeenLastCalledWith([])
  })

  it('does not rerender market order observers when pruning reacts to progress-state updates', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: 1,
      account: '0xabc',
    } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([stubOrder({ id: '1', class: OrderClass.MARKET })])
    setOrdersProgressState({ '1': { progressBarStepName: OrderProgressBarStepName.DELAYED } }, false)
    render(<OrderProgressStateUpdater />)
    expect(useOrderProgressBarPropsMock).toHaveBeenCalledTimes(1)
    useOrderProgressBarPropsMock.mockClear()
    act(() => {
      setOrdersProgressState({
        '1': { progressBarStepName: OrderProgressBarStepName.EXECUTING },
      })
    })
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['1'])
    expect(useOrderProgressBarPropsMock).not.toHaveBeenCalled()
  })
})
