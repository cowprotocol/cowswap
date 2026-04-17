import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { isBtcAddress, isEvmChain, isSolanaAddress } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Nullish } from 'types'

import { useDerivedTradeState } from 'modules/trade'

import { getAddressValidationStrategy } from 'common/utils/addressValidation/addressValidationStrategy'

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
    // Non-EVM always takes priority over the bridge provider type — do not reorder.
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
  const isKnownNonEvmAddress = isBtcAddress(recipient) || isSolanaAddress(recipient)
  if (!recipient || !isKnownNonEvmAddress) return undefined
  const nonEvmChainMatch = isNonEvmChainMatched(outputCurrency, recipient)
  // When outputCurrency is null (e.g. token not yet selected), preserve a confirmed non-EVM address
  // so it survives token selection. Once a token is selected, chain-gating applies.
  return !outputCurrency || nonEvmChainMatch ? recipient : undefined
}

/** Returns true if the output chain is non-EVM and the recipient address is valid for that chain. */
function isNonEvmChainMatched(outputCurrency: Nullish<{ chainId: number }>, recipient: Nullish<string>): boolean {
  if (!outputCurrency || !recipient) return false
  const { chainId } = outputCurrency
  if (isEvmChain(chainId)) return false
  return getAddressValidationStrategy(chainId).isValidAddress(recipient)
}

/** Resolves the EVM receiver from ENS-resolved address, typed recipient, or connected account. */
function resolveEvmReceiver(
  recipientAddress: Nullish<string>,
  recipient: Nullish<string>,
  account: Nullish<string>,
): Nullish<string> {
  return (isAddress(recipientAddress) ? recipientAddress : isAddress(recipient) ? recipient : null) || account
}
