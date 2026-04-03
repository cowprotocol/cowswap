import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { isBtcAddress, isBtcChain, isEvmAddress, isSolanaAddress, isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Nullish } from 'types'

import { useDerivedTradeState } from 'modules/trade'

import { useTradeQuote } from './useTradeQuote'

export function useQuoteParamsRecipient(): { receiver: Nullish<string>; bridgeRecipient: Nullish<string> } {
  const { bridgeQuote } = useTradeQuote()
  const state = useDerivedTradeState()
  const { account } = useWalletInfo()

  const { recipient, recipientAddress, outputCurrency } = state || {}

  const isReceiverAccountBridgeProvider = bridgeQuote?.providerInfo.type === 'ReceiverAccountBridgeProvider'

  return useMemo(() => {
    // Non-EVM recipient (Solana/BTC): pass as bridgeRecipient for the bridge provider,
    // and use account as the EVM receiver for the CoW API.
    const bridgeRecipient = resolveNonEvmBridgeRecipient(recipient, outputCurrency)
    if (bridgeRecipient) {
      return { receiver: account, bridgeRecipient }
    }

    // EVM ReceiverAccountBridgeProvider: use the custom recipient for both
    if (isReceiverAccountBridgeProvider && recipient && isAddress(recipient)) {
      return { receiver: recipient, bridgeRecipient: recipient }
    }

    // Default: EVM-only receiver, no separate bridge recipient
    return { receiver: resolveEvmReceiver(recipientAddress, recipient, account), bridgeRecipient: undefined }
  }, [isReceiverAccountBridgeProvider, account, recipient, recipientAddress, outputCurrency])
}

/** Returns the recipient if it's a non-EVM address accepted for the given output chain, otherwise undefined. */
function resolveNonEvmBridgeRecipient(
  recipient: Nullish<string>,
  outputCurrency: Nullish<{ chainId: number }>,
): Nullish<string> {
  if (!recipient || isEvmAddress(recipient)) return undefined
  const isBtcMatched = !!outputCurrency && isBtcAddress(recipient) && isBtcChain(outputCurrency.chainId)
  const isSolanaMatched = !!outputCurrency && isSolanaAddress(recipient) && isSolanaChain(outputCurrency.chainId)
  const chainMatches = !outputCurrency || isBtcMatched || isSolanaMatched
  return chainMatches ? recipient : undefined
}

/** Resolves the EVM receiver from ENS-resolved address, typed recipient, or connected account. */
function resolveEvmReceiver(
  recipientAddress: Nullish<string>,
  recipient: Nullish<string>,
  account: Nullish<string>,
): Nullish<string> {
  return (isAddress(recipientAddress) ? recipientAddress : isAddress(recipient) ? recipient : null) || account
}
