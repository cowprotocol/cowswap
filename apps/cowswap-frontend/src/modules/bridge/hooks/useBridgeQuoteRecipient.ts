import { isEvmChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from 'modules/trade'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

export function useBridgeQuoteRecipient(): string {
  const { account } = useWalletInfo()
  const tradeState = useDerivedTradeState()

  const recipient = tradeState?.recipient
  const outputChainId = tradeState?.outputCurrency?.chainId

  // For non-EVM chains, never fall back to the EVM account — it has no meaning as a bridge destination
  // and would be incorrectly displayed as the recipient in the bridge quote details UI.
  if (outputChainId && !isEvmChain(outputChainId)) {
    return recipient || BRIDGE_QUOTE_ACCOUNT
  }

  return recipient || account || BRIDGE_QUOTE_ACCOUNT
}
