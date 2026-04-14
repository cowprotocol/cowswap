import { privateKeyToAccount } from 'viem/accounts'

export const BRIDGE_QUOTE_ACCOUNT = '0xD711bD26Bf5B153001a7C0ACcb289782b6f775e9' as const

// Default BTC address used solely for fetching bridge quotes before the user sets a real receiver.
export const COW_QUOTE_BTC_BRIDGE_RECIPIENT = 'bc1q5eapy5ptdr98vtx9c5pfaa2yd20ncd3n397ek4' as const

// Default Solana address used solely for fetching bridge quotes before the user sets a real receiver.
export const COW_QUOTE_SOL_BRIDGE_RECIPIENT = 'F2nKBvD1yak1zvvGSdZdBmjKraCQX2gE14rA12Wqt23b' as const

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
