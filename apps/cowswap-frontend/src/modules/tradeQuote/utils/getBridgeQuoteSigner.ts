import { areAddressesEqual, isBtcAddress, isBtcChain, isSolanaAddress, isSolanaChain } from '@cowprotocol/cow-sdk'

import { Nullish } from 'types'
import { privateKeyToAccount } from 'viem/accounts'

export const BRIDGE_QUOTE_ACCOUNT = '0xD711bD26Bf5B153001a7C0ACcb289782b6f775e9' as const

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

const BRIDGE_QUOTE_PK = '0x68012a4467ce455b6b278b1a6815db9b7224deaa6bced68c3848ec21e6380f8a' as const

/**
 * BridgingSDK expects a signer; when disconnected we use a static viem account so hooks can be signed for quoting.
 */
const bridgeQuoteAccount = privateKeyToAccount(BRIDGE_QUOTE_PK as `0x${string}`)

export function getBridgeQuoteSigner(_chainId: number): typeof bridgeQuoteAccount & { getAddress(): string } {
  return {
    ...bridgeQuoteAccount,
    getAddress(): string {
      return bridgeQuoteAccount.address
    },
  }
}
