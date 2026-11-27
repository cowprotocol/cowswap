import { Timestamp } from 'types'

import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { TradeQuoteState, getOrderValidTo } from 'modules/tradeQuote'

export function calculateLimitOrdersDeadline(
  settingsState: LimitOrdersSettingsState,
  quoteState: TradeQuoteState,
): Timestamp {
  const { customDeadlineTimestamp } = settingsState

  // The custom deadline is an absolute timestamp persisted in localStorage, so it can be in the past by now.
  // An already expired custom deadline must not be used as validTo, fall back to the relative deadline instead
  return customDeadlineTimestamp && !isCustomDeadlineExpired(customDeadlineTimestamp)
    ? customDeadlineTimestamp
    : getOrderValidTo(settingsState.deadlineMilliseconds / 1000, quoteState)
}

export function isCustomDeadlineExpired(customDeadlineTimestamp: Timestamp, now = Date.now()): boolean {
  return customDeadlineTimestamp * 1000 <= now
}
