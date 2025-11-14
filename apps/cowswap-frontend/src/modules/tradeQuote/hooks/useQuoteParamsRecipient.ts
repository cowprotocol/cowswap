import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from 'modules/trade'

import { useTradeQuote } from './useTradeQuote'

/**
 * This hook is used in useQuoteParams() to calculate params of quote
 * Changes of useQuoteParams() result trigger the quote fetching
 * recipientAddress is present in state only when recipient is a ENS name
 * recipient in state is what user typed in the custom recipient input
 * For ReceiverAccountBridgeProvider we must trigger a new quote each time when custom recipient changes
 */
export function useQuoteParamsRecipient(): string | undefined {
  const { bridgeQuote } = useTradeQuote()
  const state = useDerivedTradeState()
  const { account } = useWalletInfo()

  const { recipient, recipientAddress } = state || {}
  const isReceiverAccountBridgeProvider = bridgeQuote?.providerInfo.type === 'ReceiverAccountBridgeProvider'

  return useMemo(() => {
    if (isReceiverAccountBridgeProvider) {
      if (recipient && isAddress(recipient)) {
        return recipient
      }
    }

    return recipientAddress && isAddress(recipientAddress) ? recipientAddress : account
  }, [isReceiverAccountBridgeProvider, account, recipient, recipientAddress])
}
