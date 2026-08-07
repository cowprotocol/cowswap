import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { SOLANA_SETTLEMENT_PROGRAM_ID_STAGING, SOLANA_SETTLEMENT_PROGRAM_ID } from '@cowprotocol/cow-sdk'

import { PublicKey } from '@solana/web3.js'

// CoW Protocol settlement program on Solana — https://github.com/cowprotocol/solana-programs
// Prod vs staging is picked by environment, mirroring how EVM contract addresses are handled
// (see `COW_PROTOCOL_VAULT_RELAYER_ADDRESS`). Also mirrors the order-flow constant in
// cowswap-frontend's solanaOrderFlow; consolidate to one source once both land.

export const solSettlementAddress = isBarnBackendEnv
  ? SOLANA_SETTLEMENT_PROGRAM_ID_STAGING
  : SOLANA_SETTLEMENT_PROGRAM_ID

const SETTLEMENT_SEED = new TextEncoder().encode('settlement')

export function findSolanaSettlementStatePda(): PublicKey {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED], new PublicKey(solSettlementAddress))[0]
}
