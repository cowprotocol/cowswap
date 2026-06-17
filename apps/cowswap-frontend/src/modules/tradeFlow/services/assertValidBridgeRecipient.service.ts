import { isNonEvmPlaceholderRecipient } from 'modules/tradeQuote'
import type { TradeQuoteState } from 'modules/tradeQuote'

export function assertValidBridgeRecipient(tradeQuoteState: TradeQuoteState): void {
  const bridgeRecipient = tradeQuoteState.bridgeQuote?.tradeParameters.bridgeRecipient

  if (isNonEvmPlaceholderRecipient(bridgeRecipient)) {
    throw new Error('Bridge recipient is a placeholder address. Please set a valid recipient before proceeding.')
  }
}
