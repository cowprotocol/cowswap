import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

export function useBridgeQuoteRecipient(): string {
  const { account } = useWalletInfo()
  const tradeState = useDerivedTradeState()

  return tradeState?.recipient || account || BRIDGE_QUOTE_ACCOUNT
}
