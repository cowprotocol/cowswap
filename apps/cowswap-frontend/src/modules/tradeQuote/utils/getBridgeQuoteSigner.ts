import { getRpcProvider } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Wallet } from '@ethersproject/wallet'

import { t } from '@lingui/core/macro'

export const BRIDGE_QUOTE_ACCOUNT = '0xD711bD26Bf5B153001a7C0ACcb289782b6f775e9'

// Default BTC address used solely for fetching bridge quotes before the user sets a real receiver.
export const COW_QUOTE_BTC_BRIDGE_RECIPIENT = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'

// Default Solana address used solely for fetching bridge quotes before the user sets a real receiver.
export const COW_QUOTE_SOL_BRIDGE_RECIPIENT = 'GGa9Q5UqJbv15hpi4TeQpHtegGYxRyZ87jyP6jqtHDRK'

const BRIDGE_QUOTE_PK = '0x68012a4467ce455b6b278b1a6815db9b7224deaa6bced68c3848ec21e6380f8a' // Belongs to BRIDGE_QUOTE_ACCOUNT
const cache = new Map<SupportedChainId, Wallet>()

/**
 * Since bridge quote requires hooks signing, we need to use a static PK in order to not ask user for signing.
 */
export function getBridgeQuoteSigner(chainId: SupportedChainId): Wallet {
  const cached = cache.get(chainId)

  if (cached) return cached

  const provider = getRpcProvider(chainId)

  if (!provider) {
    throw new Error(t`No RPC provider available for chain ID: ${chainId}`)
  }

  const quoteSigner = new Wallet(BRIDGE_QUOTE_PK, provider)

  cache.set(chainId, quoteSigner)

  return quoteSigner
}
