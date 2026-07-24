import { isBarnBackendEnv } from '@cowprotocol/common-utils'

import { PublicKey } from '@solana/web3.js'

// CoW Protocol settlement program on Solana — https://github.com/cowprotocol/solana-programs
// Prod vs staging is picked by environment, mirroring how EVM contract addresses are handled
// (see `COW_PROTOCOL_VAULT_RELAYER_ADDRESS`). Also mirrors the order-flow constant in
// cowswap-frontend's solanaOrderFlow; consolidate to one source once both land.
const SOLANA_SETTLEMENT_PROGRAM_ID_PROD = new PublicKey('moosEjJg5mbGRPRU7Vg4AaHZLvbbgknevWR9J1bNgME')
// TODO: swap in the dedicated staging program id once deployed — same as prod until then.
const SOLANA_SETTLEMENT_PROGRAM_ID_STAGING = SOLANA_SETTLEMENT_PROGRAM_ID_PROD

export const SOLANA_SETTLEMENT_PROGRAM_ID = isBarnBackendEnv
  ? SOLANA_SETTLEMENT_PROGRAM_ID_STAGING
  : SOLANA_SETTLEMENT_PROGRAM_ID_PROD

const SETTLEMENT_SEED = new TextEncoder().encode('settlement')

/**
 * Settlement state PDA — the SPL delegate a sell-token account is approved to. A token's delegation
 * counts as a CoW approval only when its on-account `delegate` equals this PDA (the program pulls the
 * sell funds through it at execution time). This is the Solana analogue of the EVM vault relayer spender.
 */
export function findSolanaSettlementStatePda(): PublicKey {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED], SOLANA_SETTLEMENT_PROGRAM_ID)[0]
}
