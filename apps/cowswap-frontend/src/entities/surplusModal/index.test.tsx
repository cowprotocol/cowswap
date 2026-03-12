import { Provider } from 'jotai'
import { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import {
  useAddOrderToSurplusQueue,
  useAutoAddOrderToSurplusQueue,
  useMarkSurplusOrderAutoShown,
  useOrderIdForSurplusModal,
  useRemoveOrderFromSurplusQueue,
  useSurplusQueueOrderIds,
} from './index'

function TestProvider({ children }: { children: ReactNode }): ReactNode {
  return <Provider>{children}</Provider>
}

describe('surplus modal queue', () => {
  it('does not auto-enqueue the same order again after dismissal', () => {
    const { result } = renderHook(
      () => ({
        queueOrderIds: useSurplusQueueOrderIds(),
        currentOrderId: useOrderIdForSurplusModal(),
        autoAddOrder: useAutoAddOrderToSurplusQueue(),
        markAutoShown: useMarkSurplusOrderAutoShown(),
        removeOrder: useRemoveOrderFromSurplusQueue(),
      }),
      { wrapper: TestProvider },
    )

    act(() => {
      result.current.autoAddOrder('order-1')
    })

    expect(result.current.queueOrderIds).toEqual(['order-1'])
    expect(result.current.currentOrderId).toBe('order-1')

    act(() => {
      result.current.markAutoShown('order-1')
      result.current.removeOrder('order-1')
    })

    expect(result.current.queueOrderIds).toEqual([])
    expect(result.current.currentOrderId).toBeUndefined()

    act(() => {
      result.current.autoAddOrder('order-1')
    })

    expect(result.current.queueOrderIds).toEqual([])
    expect(result.current.currentOrderId).toBeUndefined()
  })

  it('still allows manually reopening a dismissed order', () => {
    const { result } = renderHook(
      () => ({
        queueOrderIds: useSurplusQueueOrderIds(),
        currentOrderId: useOrderIdForSurplusModal(),
        autoAddOrder: useAutoAddOrderToSurplusQueue(),
        markAutoShown: useMarkSurplusOrderAutoShown(),
        addOrder: useAddOrderToSurplusQueue(),
        removeOrder: useRemoveOrderFromSurplusQueue(),
      }),
      { wrapper: TestProvider },
    )

    act(() => {
      result.current.autoAddOrder('order-1')
      result.current.markAutoShown('order-1')
      result.current.removeOrder('order-1')
    })

    act(() => {
      result.current.addOrder('order-1')
    })

    expect(result.current.queueOrderIds).toEqual(['order-1'])
    expect(result.current.currentOrderId).toBe('order-1')
  })

  it('does not duplicate an order already in the queue', () => {
    const { result } = renderHook(
      () => ({
        queueOrderIds: useSurplusQueueOrderIds(),
        addOrder: useAddOrderToSurplusQueue(),
        autoAddOrder: useAutoAddOrderToSurplusQueue(),
      }),
      { wrapper: TestProvider },
    )

    act(() => {
      result.current.addOrder('order-1')
      result.current.addOrder('order-1')
      result.current.autoAddOrder('order-1')
    })

    expect(result.current.queueOrderIds).toEqual(['order-1'])
  })

  it('allows auto-enqueue again when the order was removed before the modal opened', () => {
    const { result } = renderHook(
      () => ({
        queueOrderIds: useSurplusQueueOrderIds(),
        currentOrderId: useOrderIdForSurplusModal(),
        autoAddOrder: useAutoAddOrderToSurplusQueue(),
        removeOrder: useRemoveOrderFromSurplusQueue(),
      }),
      { wrapper: TestProvider },
    )

    act(() => {
      result.current.autoAddOrder('order-1')
      result.current.removeOrder('order-1')
    })

    expect(result.current.queueOrderIds).toEqual([])
    expect(result.current.currentOrderId).toBeUndefined()

    act(() => {
      result.current.autoAddOrder('order-1')
    })

    expect(result.current.queueOrderIds).toEqual(['order-1'])
    expect(result.current.currentOrderId).toBe('order-1')
  })
})
