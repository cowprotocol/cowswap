/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { SOLANA_SETTLEMENT_PROGRAM_VERSION } from '@cowprotocol/cow-sdk'

import { findSolanaSettlementStatePda } from './solanaSettlement'

describe('findSolanaSettlementStatePda', () => {
  it('derives the state PDA the deployed settlement program signs as', () => {
    // Bumping the program version moves every PDA and invalidates existing delegations. Re-derive this
    // expectation with the release's own generated client (`findStatePdaPda`) before updating it.
    expect(SOLANA_SETTLEMENT_PROGRAM_VERSION).toBe('0.3')
    expect(findSolanaSettlementStatePda().toBase58()).toBe('9MM8zpg6xeDzgnzKJhgW2Jptd5yRk2NqBUigPZ6STWGz')
  })
})
