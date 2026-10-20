import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserRejectedRequestError } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'

import { act, renderHook } from '@testing-library/react'

import { useCancelOrder, useOrderCancellation } from './useCancelOrder'

import { cancelOrder } from '../api/cancelOrder'

import type { OpenOrder } from '../api/openOrders'

jest.mock('wagmi', () => ({ useConfig: () => ({}) }))
jest.mock('wagmi/actions', () => ({ waitForTransactionReceipt: jest.fn() }))
jest.mock('../api/cancelOrder', () => ({ cancelOrder: jest.fn() }))

const cancelOrderMock = cancelOrder as jest.Mock
const waitForReceiptMock = waitForTransactionReceipt as jest.Mock
const TX_HASH = `0x${'ab'.repeat(32)}`
const ORDER = { uid: '0xuid', chainId: 1 } as OpenOrder

function renderCancelOrder(): {
  result: { current: { cancel: ReturnType<typeof useCancelOrder>; state: ReturnType<typeof useOrderCancellation> } }
  invalidateQueries: jest.SpyInstance
} {
  const queryClient = new QueryClient()
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )
  const { result } = renderHook(() => ({ cancel: useCancelOrder(), state: useOrderCancellation(ORDER.uid) }), {
    wrapper,
  })

  return { result, invalidateQueries }
}

describe('useCancelOrder', () => {
  afterEach(() => jest.resetAllMocks())

  it('marks a soft-cancelled order and refetches the open orders', async () => {
    cancelOrderMock.mockResolvedValue(null)
    const { result, invalidateQueries } = renderCancelOrder()

    await act(() => result.current.cancel(ORDER, 'soft'))

    expect(cancelOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: 1, orderUid: '0xuid', type: 'soft' }),
    )
    expect(result.current.state).toEqual({ status: 'cancelled', type: 'soft' })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['rwa', 'open-orders'] })
  })

  it('waits for the hard cancellation transaction', async () => {
    let confirm: (receipt: { status: string }) => void = () => undefined
    cancelOrderMock.mockResolvedValue(TX_HASH)
    waitForReceiptMock.mockReturnValue(new Promise((resolve) => (confirm = resolve)))
    const { result } = renderCancelOrder()

    let cancelling: Promise<void> = Promise.resolve()
    await act(async () => {
      cancelling = result.current.cancel(ORDER, 'hard')
    })

    expect(result.current.state).toEqual({ status: 'pending', type: 'hard', txHash: TX_HASH })

    await act(async () => {
      confirm({ status: 'success' })
      await cancelling
    })

    expect(waitForReceiptMock).toHaveBeenCalledWith({}, { chainId: 1, hash: TX_HASH })
    expect(result.current.state).toEqual({ status: 'cancelled', type: 'hard' })
  })

  it('reports a reverted cancellation transaction', async () => {
    cancelOrderMock.mockResolvedValue(TX_HASH)
    waitForReceiptMock.mockResolvedValue({ status: 'reverted' })
    const { result } = renderCancelOrder()

    await act(() => result.current.cancel(ORDER, 'hard'))

    expect(result.current.state).toEqual({
      status: 'failed',
      type: 'hard',
      error: 'The cancellation transaction reverted',
    })
  })

  it('forgets the cancellation when the user rejects it in the wallet', async () => {
    cancelOrderMock.mockRejectedValue(new UserRejectedRequestError(new Error('User rejected')))
    const { result, invalidateQueries } = renderCancelOrder()

    await act(() => result.current.cancel(ORDER, 'soft'))

    expect(result.current.state).toBe(undefined)
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
