import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import {
  SOLANA_SETTLEMENT_PROGRAM_ID_STAGING,
  SOLANA_SETTLEMENT_PROGRAM_ID,
  SOLANA_SETTLEMENT_PROGRAM_VERSION,
} from '@cowprotocol/cow-sdk'

import { PublicKey } from '@solana/web3.js'

// CoW Protocol settlement program on Solana — https://github.com/cowprotocol/solana-programs
// Prod vs staging is picked by environment, mirroring how EVM contract addresses are handled
// (see `COW_PROTOCOL_VAULT_RELAYER_ADDRESS`). Also mirrors the order-flow constant in
// cowswap-frontend's solanaOrderFlow; consolidate to one source once both land.

export const solSettlementAddress = isBarnBackendEnv
  ? SOLANA_SETTLEMENT_PROGRAM_ID_STAGING
  : SOLANA_SETTLEMENT_PROGRAM_ID

const SEED_PREFIX = 'settlement v'
// The program right-pads `<major>.<minor>` to a fixed width so no version's seed can be a byte prefix
// of another's. The padding is part of the seed: dropping it derives an address the settlement program
// never signs as, so approvals land on a delegate that can't move the funds.
// https://github.com/cowprotocol/solana-programs/blob/main/interface/src/pda/mod.rs
const SEED_VERSION_WIDTH = 7

const SETTLEMENT_SEED = new TextEncoder().encode(
  SEED_PREFIX + SOLANA_SETTLEMENT_PROGRAM_VERSION.padEnd(SEED_VERSION_WIDTH, ' '),
)

export function findSolanaSettlementStatePda(): PublicKey {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED], new PublicKey(solSettlementAddress))[0]
}
