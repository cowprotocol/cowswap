import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { solana, solanaDevnet } from '@reown/appkit/networks'

export const IS_SOLANA_DEVNET = process.env.REACT_APP_SOLANA_CLUSTER === 'devnet'

export const SOLANA_NETWORK = IS_SOLANA_DEVNET ? solanaDevnet : solana

export const SOLANA_RPC_URL: string = IS_SOLANA_DEVNET
  ? process.env.REACT_APP_SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com'
  : RPC_URLS[SupportedChainId.SOLANA]
