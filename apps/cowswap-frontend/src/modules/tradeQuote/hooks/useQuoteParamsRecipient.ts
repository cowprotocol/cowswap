import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { isBtcAddress, isBtcChain, isSolanaAddress, isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Nullish } from 'types'

import { useDerivedTradeState } from 'modules/trade'

import { useTradeQuote } from './useTradeQuote'

import { COW_QUOTE_BTC_BRIDGE_RECIPIENT, COW_QUOTE_SOL_BRIDGE_RECIPIENT } from '../utils/getBridgeQuoteSigner'

/** Maps a chain predicate + address validator + default quote recipient for each non-EVM chain. */
const NON_EVM_CHAIN_CONFIG: {
  isChain: (chainId: number) => boolean
  isAddress: (address: Nullish<string>) => boolean
  defaultRecipient: string
}[] = [
  { isChain: isBtcChain, isAddress: isBtcAddress, defaultRecipient: COW_QUOTE_BTC_BRIDGE_RECIPIENT },
  { isChain: isSolanaChain, isAddress: isSolanaAddress, defaultRecipient: COW_QUOTE_SOL_BRIDGE_RECIPIENT },
]

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

    // Provide default non-EVM bridgeRecipient for quoting when user hasn't set one yet.
    // Only applies when recipient is empty — must not override a non-empty but invalid/wrong-chain value.
    const defaultBridgeRecipient = !recipient && getDefaultNonEvmBridgeRecipient(outputCurrency)
    if (defaultBridgeRecipient) {
      return { receiver: account, bridgeRecipient: defaultBridgeRecipient }
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
  const isNonEvmAddress = NON_EVM_CHAIN_CONFIG.some(({ isAddress: isNonEvmAddr }) => isNonEvmAddr(recipient))
  if (!recipient || !isNonEvmAddress) return undefined

  // When outputCurrency is null (e.g. token not yet selected), preserve a confirmed non-EVM address
  // so it survives token selection. Once a token is selected, chain-gating applies.
  if (!outputCurrency) return recipient

  const chainMatches = NON_EVM_CHAIN_CONFIG.some(
    ({ isChain, isAddress: isNonEvmAddr }) => isChain(outputCurrency.chainId) && isNonEvmAddr(recipient),
  )
  return chainMatches ? recipient : undefined
}

/** Returns the default non-EVM bridge recipient address for quoting when the user hasn't set one yet. */
function getDefaultNonEvmBridgeRecipient(outputCurrency: Nullish<{ chainId: number }>): string | undefined {
  if (!outputCurrency) return undefined
  return NON_EVM_CHAIN_CONFIG.find(({ isChain }) => isChain(outputCurrency.chainId))?.defaultRecipient
}

/** Resolves the EVM receiver from ENS-resolved address, typed recipient, or connected account. */
function resolveEvmReceiver(
  recipientAddress: Nullish<string>,
  recipient: Nullish<string>,
  account: Nullish<string>,
): Nullish<string> {
  return (isAddress(recipientAddress) ? recipientAddress : isAddress(recipient) ? recipient : null) || account
}
