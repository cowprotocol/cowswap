import { Timestamp } from 'types'

import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { TradeQuoteState } from 'modules/tradeQuote'

export function calculateLimitOrdersDeadline(
  settingsState: LimitOrdersSettingsState,
  quoteState: TradeQuoteState
): Timestamp {
  return settingsState.customDeadlineTimestamp
    ? settingsState.customDeadlineTimestamp
    : Math.floor((settingsState.deadlineMilliseconds + Date.now()) / 1000)
  // : getOrderValidTo(settingsState.deadlineMilliseconds / 1000, {
  //     validFor: quoteState.quoteParams?.validFor,
  //     quoteValidTo: quoteState.response?.quote.validTo,
  //     localQuoteTimestamp: quoteState.localQuoteTimestamp,
  //   })
}
