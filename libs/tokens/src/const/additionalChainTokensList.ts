import { AdditionalTargetChainId, TargetChainId } from '@cowprotocol/cow-sdk'

import { ListSourceConfig } from '../types'

/**
 * Default token list sources for additional target chains (non-EVM, bridge-only destinations).
 * These chains are not covered by DEFAULT_TOKENS_LISTS (which is for SupportedChainId/EVM only).
 */
export const DEFAULT_ADDITIONAL_CHAIN_TOKENS_LISTS: Partial<Record<TargetChainId, ListSourceConfig[]>> = {
  [AdditionalTargetChainId.SOLANA]: [
    { priority: 1, enabledByDefault: true, source: 'https://files.cow.fi/token-lists/NearSolana.json' },
  ],
}
