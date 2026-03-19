import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { isBtcAddress, isSolanaAddress } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from 'modules/trade'

import { useTradeQuote } from './useTradeQuote'

/**
 * Returns { receiver, bridgeRecipient } for quote params.
 *
 * - `receiver`: always an EVM address (for CoW API). Falls back to account.
 * - `bridgeRecipient`: the final destination address for the bridge provider.
 *   Can be non-EVM (Solana/BTC). Undefined when not bridging to non-EVM chains.
 *
 * recipientAddress is present in state only when recipient is an ENS name.
 * recipient in state is what user typed in the custom recipient input.
 * For ReceiverAccountBridgeProvider we must trigger a new quote each time when custom recipient changes.
 */
export function useQuoteParamsRecipient(): { receiver: string | undefined; bridgeRecipient: string | undefined } {
  const { bridgeQuote } = useTradeQuote()
  const state = useDerivedTradeState()
  const { account } = useWalletInfo()

  const { recipient, recipientAddress } = state || {}

  const isReceiverAccountBridgeProvider = bridgeQuote?.providerInfo.type === 'ReceiverAccountBridgeProvider'

  return useMemo(() => {
    // Non-EVM recipient (Solana/BTC): pass as bridgeRecipient for the bridge provider,
    // and use account as the EVM receiver for the CoW API.
    if (recipient && (isBtcAddress(recipient) || isSolanaAddress(recipient))) {
      return { receiver: account, bridgeRecipient: recipient }
    }

    // EVM ReceiverAccountBridgeProvider: use the custom recipient for both
    if (isReceiverAccountBridgeProvider && recipient && isAddress(recipient)) {
      return { receiver: recipient, bridgeRecipient: recipient }
    }

    // Default: EVM-only receiver, no separate bridge recipient
    const evmReceiver =
      (isAddress(recipientAddress) ? recipientAddress : isAddress(recipient) ? recipient : null) || account

    return { receiver: evmReceiver, bridgeRecipient: undefined }
  }, [isReceiverAccountBridgeProvider, account, recipient, recipientAddress])
}
