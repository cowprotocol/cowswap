import type { PrimitiveAtom } from 'jotai'

import { OrderClass } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { render } from '@testing-library/react'
import { useSurplusQueueOrderIds } from 'entities/surplusModal'

import type { Order } from 'legacy/state/orders/actions'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { useTradeConfirmState } from 'modules/trade'

import { OrderProgressStateUpdater } from './OrderProgressStateUpdater'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('legacy/state/orders/hooks', () => ({
  useOnlyPendingOrders: jest.fn(),
}))

jest.mock('../hooks/useOrderProgressBarProps', () => ({
  useOrderProgressBarProps: jest.fn(),
}))

jest.mock('entities/surplusModal', () => ({
  useSurplusQueueOrderIds: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useTradeConfirmState: jest.fn(),
}))

const mockPruneOrders = jest.fn()
const mockCancellationIds = jest.fn()

jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai')

  return {
    ...actual,
    useSetAtom: jest.fn((atom: PrimitiveAtom<unknown>) => {
      const { pruneOrdersProgressBarState } = jest.requireActual('../state/atoms')

      if (atom === pruneOrdersProgressBarState) {
        return mockPruneOrders
      }

      return actual.useSetAtom(atom)
    }),
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
const useOrderProgressBarPropsMock = useOrderProgressBarProps as jest.MockedFunction<typeof useOrderProgressBarProps>
const useSurplusQueueOrderIdsMock = useSurplusQueueOrderIds as jest.MockedFunction<typeof useSurplusQueueOrderIds>
const useTradeConfirmStateMock = useTradeConfirmState as jest.MockedFunction<typeof useTradeConfirmState>

type WalletInfo = ReturnType<typeof useWalletInfo>

const stubOrder = (overrides: Partial<Order>): Order => overrides as Order

describe('OrderProgressStateUpdater', () => {
  beforeEach(() => {
    useOrderProgressBarPropsMock.mockReturnValue({
      props: {} as never,
      activityDerivedState: null,
    })
    useSurplusQueueOrderIdsMock.mockReturnValue([])
    useTradeConfirmStateMock.mockReturnValue({ transactionHash: null } as never)
    mockCancellationIds.mockReturnValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockPruneOrders.mockReset()
  })

  it('subscribes to pending market orders even when the progress bar UI is not mounted', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: 1,
      account: '0xabc',
    } as unknown as WalletInfo)

    useOnlyPendingOrdersMock.mockReturnValue([
      stubOrder({ id: '1', class: OrderClass.MARKET }),
      stubOrder({ id: '2', class: OrderClass.LIMIT }),
      stubOrder({ id: '3', class: OrderClass.MARKET }),
    ])

    render(<OrderProgressStateUpdater />)

    expect(useOrderProgressBarPropsMock).toHaveBeenCalledTimes(2)
    expect(useOrderProgressBarPropsMock).toHaveBeenNthCalledWith(1, 1, expect.objectContaining({ id: '1' }))
    expect(useOrderProgressBarPropsMock).toHaveBeenNthCalledWith(2, 1, expect.objectContaining({ id: '3' }))
    expect(mockPruneOrders).toHaveBeenLastCalledWith(['1', '3'])
  })

  it('does nothing when wallet information is missing', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: undefined,
      account: undefined,
    } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([])

    render(<OrderProgressStateUpdater />)

    expect(useOrderProgressBarPropsMock).not.toHaveBeenCalled()
    expect(mockPruneOrders).toHaveBeenLastCalledWith([])
  })

  it('keeps state for orders queued for the surplus modal', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: undefined,
      account: undefined,
    } as unknown as WalletInfo)
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
})
