import {
  DEFAULT_APP_CODE,
  SOLANA_LIMIT_ORDER_PROD_APP_DATA,
  SOLANA_LIMIT_ORDER_STAGING_APP_DATA,
} from '@cowprotocol/common-const'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import type { SwapAdvancedSettings } from '@cowprotocol/cow-sdk'

/**
 * What a Solana order signed before the order book served appData. Used while `isSolanaAppDataEnabled`
 * is off: the doc is never registered, so it must stay a value the UI can classify on its own.
 * Delete this module once the flag is removed.
 */
export const LEGACY_SOLANA_SWAP_APP_DATA: SwapAdvancedSettings['appData'] = {
  appCode: DEFAULT_APP_CODE,
  environment: isBarnBackendEnv ? 'staging' : 'prod',
  metadata: { orderClass: { orderClass: 'market' } },
}

export const LEGACY_SOLANA_LIMIT_APP_DATA_HASH = isBarnBackendEnv
  ? SOLANA_LIMIT_ORDER_STAGING_APP_DATA
  : SOLANA_LIMIT_ORDER_PROD_APP_DATA
