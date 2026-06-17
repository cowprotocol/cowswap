import type { TradeQuoteState } from '../state/tradeQuoteAtom'

import { isNonEvmPlaceholderRecipient } from '../utils/getBridgeQuoteSigner'

export function assertValidBridgeRecipient(tradeQuoteState: TradeQuoteState): void {
  /**
   * Safety guard: placeholder addresses injected into quote requests so that routes and prices can
   * be fetched before the user has entered a real non-EVM destination address. They must never reach
   * an actual order.
   *
   * The UI already blocks order submission via the RecipientNotSet form validation, but this check
   * is a last-resort defence against any path (race condition, future refactor, etc.) that could
   * bypass that gate and call postSwapOrderFromQuote with a stale quote still holding a placeholder.
   */
  const bridgeRecipient = tradeQuoteState.bridgeQuote?.tradeParameters.bridgeRecipient

  if (isNonEvmPlaceholderRecipient(bridgeRecipient)) {
    throw new Error('Bridge recipient is a placeholder address. Please set a valid recipient before proceeding.')
  }
}
