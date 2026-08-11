import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenInfo } from '@uniswap/token-lists'

export const GLOBAL_TOKENS_OVERRIDES: Partial<Record<number, { [address: string]: TokenInfo | null }>> = {
  [SupportedChainId.GNOSIS_CHAIN]: {
    '0xcb444e90d8198415266c6a2724b7900fb12fc56e': null, // Legacy EURe
  },
}
