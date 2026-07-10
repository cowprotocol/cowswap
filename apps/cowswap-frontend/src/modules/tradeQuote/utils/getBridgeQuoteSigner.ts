import { jotaiStore } from '@cowprotocol/core'
import { areAddressesEqual, isBtcAddress, isBtcChain, isSolanaAddress, isSolanaChain } from '@cowprotocol/cow-sdk'

import { Nullish } from 'types'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

import { bridgeQuotePrivateKeyAtom, isBridgeQuotePrivateKey } from '../state/bridgeQuoteSignerAtom'

import type { BridgeQuotePrivateKey } from '../state/bridgeQuoteSignerAtom'

// Default BTC address used solely for fetching bridge quotes before the user sets a real receiver.
export const COW_QUOTE_BTC_BRIDGE_RECIPIENT = 'bc1q5eapy5ptdr98vtx9c5pfaa2yd20ncd3n397ek4' as const

// Default Solana address used solely for fetching bridge quotes before the user sets a real receiver.
export const COW_QUOTE_SOL_BRIDGE_RECIPIENT = 'F2nKBvD1yak1zvvGSdZdBmjKraCQX2gE14rA12Wqt23b' as const

/** Maps a chain predicate + address validator + default quote recipient for each non-EVM chain. */
export const NON_EVM_CHAIN_CONFIG: {
  isChain: (chainId: number) => boolean
  isAddress: (address: Nullish<string>) => boolean
  defaultRecipient: string
}[] = [
  { isChain: isBtcChain, isAddress: isBtcAddress, defaultRecipient: COW_QUOTE_BTC_BRIDGE_RECIPIENT },
  { isChain: isSolanaChain, isAddress: isSolanaAddress, defaultRecipient: COW_QUOTE_SOL_BRIDGE_RECIPIENT },
]

/** Returns true if the address is one of the placeholder recipients injected for non-EVM quote requests. */
export function isNonEvmPlaceholderRecipient(address: Nullish<string>): boolean {
  return NON_EVM_CHAIN_CONFIG.some(({ defaultRecipient }) => areAddressesEqual(address, defaultRecipient))
}

const bridgeQuoteAccount = privateKeyToAccount(getBridgeQuotePrivateKey())
export const BRIDGE_QUOTE_ACCOUNT = bridgeQuoteAccount.address

export function getBridgeQuoteSigner(_chainId: number): typeof bridgeQuoteAccount & { getAddress(): string } {
  return {
    ...bridgeQuoteAccount,
    getAddress(): string {
      return bridgeQuoteAccount.address
    },
  }
}

function getBridgeQuotePrivateKey(): BridgeQuotePrivateKey {
  const storedPrivateKey = jotaiStore.get(bridgeQuotePrivateKeyAtom)

  if (isBridgeQuotePrivateKey(storedPrivateKey)) return storedPrivateKey

  const privateKey = generatePrivateKey()

  jotaiStore.set(bridgeQuotePrivateKeyAtom, privateKey)

  return privateKey
}
