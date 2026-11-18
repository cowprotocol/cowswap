import {
  getLimitOrderDeadlineDuration,
  getOrderExpiryWarningTier,
  OrderExpiryWarningTier,
} from './getOrderExpiryWarningTier.utils'

import { LIMIT_ORDERS_DEADLINES } from '../pure/DeadlineSelector/deadlines'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'

const ONE_MINUTE_MS = 60 * 1000
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS
const ONE_DAY_MS = 24 * ONE_HOUR_MS
const NOW = 1713264841000

describe('getOrderExpiryWarningTier()', () => {
  it.each([
    [5 * ONE_MINUTE_MS, OrderExpiryWarningTier.None],
    [ONE_DAY_MS, OrderExpiryWarningTier.None],
    [3 * ONE_DAY_MS, OrderExpiryWarningTier.None],
    [3 * ONE_DAY_MS + 1, OrderExpiryWarningTier.Subtle],
    [7 * ONE_DAY_MS, OrderExpiryWarningTier.Subtle],
    [7 * ONE_DAY_MS + 1, OrderExpiryWarningTier.Prominent],
    [30 * ONE_DAY_MS, OrderExpiryWarningTier.Prominent],
    [365 * ONE_DAY_MS, OrderExpiryWarningTier.Prominent],
  ])('maps %i ms to %s', (durationMs, expected) => {
    expect(getOrderExpiryWarningTier(durationMs)).toBe(expected)
  })

  it('maps the preset deadlines to the expected tiers', () => {
    const tiers = LIMIT_ORDERS_DEADLINES.map(({ value }) => getOrderExpiryWarningTier(value))

    expect(tiers).toEqual([
      OrderExpiryWarningTier.None,
      OrderExpiryWarningTier.None,
      OrderExpiryWarningTier.None,
      OrderExpiryWarningTier.None,
      OrderExpiryWarningTier.None,
      OrderExpiryWarningTier.Subtle,
      OrderExpiryWarningTier.Prominent,
      OrderExpiryWarningTier.Prominent,
    ])
  })
})

describe('getLimitOrderDeadlineDuration()', () => {
  it('returns the relative deadline when there is no custom deadline', () => {
    const settings = { ...defaultLimitOrdersSettings, deadlineMilliseconds: 3 * ONE_DAY_MS }

    expect(getLimitOrderDeadlineDuration(settings, NOW)).toBe(3 * ONE_DAY_MS)
  })

  it('returns the time left until a custom deadline', () => {
    const customDeadlineTimestamp = (NOW + 60 * ONE_DAY_MS) / 1000
    const settings = { ...defaultLimitOrdersSettings, customDeadlineTimestamp }

    expect(getLimitOrderDeadlineDuration(settings, NOW)).toBe(60 * ONE_DAY_MS)
  })

  it('falls back to the relative deadline when the custom deadline has expired', () => {
    const customDeadlineTimestamp = (NOW - ONE_HOUR_MS) / 1000
    const settings = { ...defaultLimitOrdersSettings, deadlineMilliseconds: ONE_DAY_MS, customDeadlineTimestamp }

    expect(getLimitOrderDeadlineDuration(settings, NOW)).toBe(ONE_DAY_MS)
  })
})
