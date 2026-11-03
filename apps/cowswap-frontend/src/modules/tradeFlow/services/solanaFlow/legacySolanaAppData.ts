import {
  DEFAULT_APP_CODE,
  SOLANA_LIMIT_ORDER_PROD_APP_DATA,
  SOLANA_LIMIT_ORDER_STAGING_APP_DATA,
} from '@cowprotocol/common-const'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import type { SwapAdvancedSettings } from '@cowprotocol/cow-sdk'

/**
 * The swap's appData override while `isSolanaAppDataEnabled` is off. The SDK merges it onto the quote's doc,
 * so the signed hash differs per order and is never registered; the UI classifies such a swap only by not
 * matching `LEGACY_SOLANA_LIMIT_APP_DATA_HASH`. Delete this module once the flag is removed.
 */
export const LEGACY_SOLANA_SWAP_APP_DATA: SwapAdvancedSettings['appData'] = {
  appCode: DEFAULT_APP_CODE,
  environment: isBarnBackendEnv ? 'staging' : 'prod',
  metadata: { orderClass: { orderClass: 'market' } },
}

export const LEGACY_SOLANA_LIMIT_APP_DATA_HASH = isBarnBackendEnv
  ? SOLANA_LIMIT_ORDER_STAGING_APP_DATA
  : SOLANA_LIMIT_ORDER_PROD_APP_DATA
