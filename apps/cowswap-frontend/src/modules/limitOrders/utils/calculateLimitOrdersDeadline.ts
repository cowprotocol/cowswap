import { Timestamp } from 'types'

import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { TradeQuoteState, getOrderValidTo } from 'modules/tradeQuote'

export function calculateLimitOrdersDeadline(
  settingsState: LimitOrdersSettingsState,
  quoteState: TradeQuoteState,
): Timestamp {
  return settingsState.customDeadlineTimestamp
    ? settingsState.customDeadlineTimestamp
    : getOrderValidTo(settingsState.deadlineMilliseconds / 1000, quoteState)
}
