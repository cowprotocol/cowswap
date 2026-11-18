import { OrderStatus } from '@cowprotocol/cow-sdk'

import { formatOrderProgress, getOrderStatusLabel } from './orderProgress'

import type { TwapProgress } from './twapProgress'

const NOW = 1_800_000_000

describe('formatOrderProgress', () => {
  it('counts down to the expiry', () => {
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW + 28 * 60 }, NOW)).toBe('Expires in 28 min')
  })

  it('rounds the minutes up', () => {
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW + 27 * 60 + 1 }, NOW)).toBe('Expires in 28 min')
  })

  it('shows hours and days for later expiries', () => {
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW + 6 * 3600 + 120 }, NOW)).toBe('Expires in 6h')
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW + 3 * 86_400 }, NOW)).toBe('Expires in 3d')
  })

  it('shows the filled part and the time left of a partly filled order', () => {
    expect(formatOrderProgress({ filledFraction: 0.25, validTo: NOW + 6 * 3600 }, NOW)).toBe('25% filled · 6h left')
  })

  it('shows an order past its expiry the order book still lists as open as expired', () => {
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW - 30 }, NOW)).toBe('Expired')
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW }, NOW)).toBe('Expired')
    expect(formatOrderProgress({ filledFraction: 0.25, validTo: NOW - 30 }, NOW)).toBe('25% filled · Expired')
  })
})

describe('getOrderStatusLabel', () => {
  const twapProgress = (isScheduled: boolean): TwapProgress => ({
    isScheduled,
    part: 1,
    partsCount: 2,
    minutesLeft: 10,
    isLastPart: false,
  })

  it('shows Open until validTo, then Expired', () => {
    expect(getOrderStatusLabel({ status: OrderStatus.OPEN, validTo: NOW + 60 }, null, NOW)).toBe('Open')
    expect(getOrderStatusLabel({ status: OrderStatus.OPEN, validTo: NOW }, null, NOW)).toBe('Expired')
  })

  it('keeps the presign and TWAP labels regardless of validTo', () => {
    expect(getOrderStatusLabel({ status: OrderStatus.PRESIGNATURE_PENDING, validTo: NOW - 60 }, null, NOW)).toBe(
      'Awaiting signature',
    )
    expect(getOrderStatusLabel({ status: OrderStatus.OPEN, validTo: NOW - 60 }, twapProgress(true), NOW)).toBe(
      'Scheduled',
    )
    expect(getOrderStatusLabel({ status: OrderStatus.OPEN, validTo: NOW - 60 }, twapProgress(false), NOW)).toBe('Open')
  })
})
