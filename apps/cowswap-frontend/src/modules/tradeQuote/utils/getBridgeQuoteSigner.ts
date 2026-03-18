import { privateKeyToAccount } from 'viem/accounts'

export const BRIDGE_QUOTE_ACCOUNT = '0xD711bD26Bf5B153001a7C0ACcb289782b6f775e9' as const

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
