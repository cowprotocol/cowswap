import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { getSolanaDelegateAuthority } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

// Derives ed25519 curve math that jsdom cannot run, so this must stay a lazily-called function:
// evaluating it at module scope breaks every jsdom suite that imports this file.
export function findSolanaSettlementStatePda(): PublicKey {
  return getSolanaDelegateAuthority(isBarnBackendEnv ? 'staging' : 'prod')
}
