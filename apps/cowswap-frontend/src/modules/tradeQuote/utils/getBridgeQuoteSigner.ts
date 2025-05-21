import { getRpcProvider } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Wallet } from '@ethersproject/wallet'

const BRIDGE_QUOTE_PK = '0x68012a4467ce455b6b278b1a6815db9b7224deaa6bced68c3848ec21e6380f8a' // address: 0xD711bD26Bf5B153001a7C0ACcb289782b6f775e9
const cache = new Map<SupportedChainId, Wallet>()

/**
 * Since bridge quote requires hooks signing, we need to use a static PK in order to not ask user for signing.
 */
export function getBridgeQuoteSigner(chainId: SupportedChainId): Wallet {
  const cached = cache.get(chainId)

  if (cached) return cached

  const provider = getRpcProvider(chainId)

  if (!provider) {
    throw new Error(`No RPC provider available for chain ID: ${chainId}`)
  }

  const quoteSigner = new Wallet(BRIDGE_QUOTE_PK, provider)

  cache.set(chainId, quoteSigner)

  return quoteSigner
}
