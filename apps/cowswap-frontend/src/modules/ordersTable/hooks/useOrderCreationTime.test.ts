import { act, renderHook } from '@testing-library/react'

import { OrderStatus } from 'legacy/state/orders/actions'

import { useOrderCreationTime } from './useOrderCreationTime'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { locale: 'en-US' } }),
}))

describe('useOrderCreationTime', () => {
  const now = new Date('2026-09-10T12:00:00Z')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
  })

  afterEach(() => jest.useRealTimers())

  it.each([
    [180, 'in 3 minutes'],
    [60, 'in 1 minute'],
    [22, 'in 22 seconds'],
    [1, 'in 1 second'],
  ])('shows the countdown with %s seconds remaining', (seconds, expected) => {
    const creationTime = new Date(now.getTime() + seconds * 1000)
    const { result } = renderHook(() => useOrderCreationTime(creationTime, OrderStatus.SCHEDULED))
    expect(result.current).toEqual({ isScheduledCreating: false, creationTimeAgo: expected })
  })

  it('switches to creating exactly at the scheduled start without new order data', () => {
    const creationTime = new Date(now.getTime() + 2000)
    const { result } = renderHook(() => useOrderCreationTime(creationTime, OrderStatus.SCHEDULED))
    act(() => jest.advanceTimersByTime(1000))
    expect(result.current).toEqual({ isScheduledCreating: false, creationTimeAgo: 'in 1 second' })
    act(() => jest.advanceTimersByTime(1000))
    expect(result.current.isScheduledCreating).toBe(true)
  })

  it.each([OrderStatus.PENDING, OrderStatus.FULFILLED, OrderStatus.CANCELLED, OrderStatus.EXPIRED])(
    'shows elapsed time instead of creating for %s parts',
    (status) => {
      const creationTime = new Date(now.getTime() - 180_000)
      const { result } = renderHook(() => useOrderCreationTime(creationTime, status))
      expect(result.current).toEqual({ isScheduledCreating: false, creationTimeAgo: '3 minutes ago' })
    },
  )
})
