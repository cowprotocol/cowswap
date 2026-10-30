import { CrossChainQuoteAndPost } from '@cowprotocol/sdk-bridging'

import { DEFAULT_TRADE_QUOTE_STATE, TradeQuoteState } from 'modules/tradeQuote'

import { calculateLimitOrdersDeadline, isCustomDeadlineExpired } from './calculateLimitOrdersDeadline'

import { defaultLimitOrdersSettings, LimitOrdersSettingsState } from '../state/limitOrdersSettingsAtom'

// 2024-04-16T10:54:01.000Z
const NOW_TIME = 1713264841000
const NOW_SECONDS = NOW_TIME / 1000

const VALID_FOR = 60 // seconds

// Quote fetched right now, no clock offset between client and server
const quoteState = {
  ...DEFAULT_TRADE_QUOTE_STATE,
  localQuoteTimestamp: NOW_SECONDS,
  quote: {
    quoteResults: {
      tradeParameters: { validFor: VALID_FOR },
      quoteResponse: { quote: { validTo: NOW_SECONDS + VALID_FOR } },
    },
  } as CrossChainQuoteAndPost,
} as TradeQuoteState

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function getSettings(customDeadlineTimestamp: number | null): LimitOrdersSettingsState {
  return { ...defaultLimitOrdersSettings, deadlineMilliseconds: ONE_DAY_MS, customDeadlineTimestamp }
}

describe('calculateLimitOrdersDeadline()', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW_TIME)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('uses the relative deadline when there is no custom deadline', () => {
    expect(calculateLimitOrdersDeadline(getSettings(null), quoteState)).toBe(NOW_SECONDS + ONE_DAY_MS / 1000)
  })

  it('uses the custom deadline when it is in the future', () => {
    const customDeadline = NOW_SECONDS + 3 * 60 * 60

    expect(calculateLimitOrdersDeadline(getSettings(customDeadline), quoteState)).toBe(customDeadline)
  })

  it('does not use a persisted custom deadline that has already passed', () => {
    // Custom deadline picked a while ago and persisted in localStorage, it's in the past by now
    const expiredCustomDeadline = NOW_SECONDS - 60 * 60

    const validTo = calculateLimitOrdersDeadline(getSettings(expiredCustomDeadline), quoteState)

    expect(validTo).toBe(NOW_SECONDS + ONE_DAY_MS / 1000)
    expect(validTo).toBeGreaterThan(NOW_SECONDS)
  })

  it('does not use a custom deadline that expires right now', () => {
    expect(calculateLimitOrdersDeadline(getSettings(NOW_SECONDS), quoteState)).toBe(NOW_SECONDS + ONE_DAY_MS / 1000)
  })
})

describe('isCustomDeadlineExpired()', () => {
  it('returns false for a timestamp in the future', () => {
    expect(isCustomDeadlineExpired(NOW_SECONDS + 1, NOW_TIME)).toBe(false)
  })

  it('returns true for a timestamp in the past or right now', () => {
    expect(isCustomDeadlineExpired(NOW_SECONDS - 1, NOW_TIME)).toBe(true)
    expect(isCustomDeadlineExpired(NOW_SECONDS, NOW_TIME)).toBe(true)
  })
})
