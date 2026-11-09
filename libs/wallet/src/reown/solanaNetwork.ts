import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { solana, solanaDevnet } from '@reown/appkit/networks'

/**
 * Solana cluster used by the wallet connector.
 *
 * Defaults to mainnet. Deployments that target devnet (for example the
 * graffiti wall) opt in with `REACT_APP_SOLANA_CLUSTER=devnet` rather than
 * patching the shared connector, so a build can never reach mainnet users
 * pointing at a test cluster.
 *
 * Lives beside `networks.ts` because importing from `@reown/appkit/networks`
 * pulls in Reown's ESM-only bundle.
 */
export const IS_SOLANA_DEVNET = process.env.REACT_APP_SOLANA_CLUSTER === 'devnet'

export const SOLANA_NETWORK = IS_SOLANA_DEVNET ? solanaDevnet : solana

export const SOLANA_RPC_URL: string = IS_SOLANA_DEVNET
  ? process.env.REACT_APP_SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com'
  : RPC_URLS[SupportedChainId.SOLANA]
