/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { planCreateBuyAtaStep } from './planCreateBuyAtaStep'
import { SolanaFlowStep } from './types'

import type { PlanCreateBuyAtaStepParams } from './planCreateBuyAtaStep'

type PlanQuote = PlanCreateBuyAtaStepParams['quote']

const PAYER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const RECEIVER = new PublicKey('5k75h1UBx8gJp6kTkPcbkgAgPmrPBiLHLLXmzMfVsBEZ')
const BUY_MINT = new PublicKey('So11111111111111111111111111111111111111112')

function planFor(programId?: PublicKey): { buyTokenAccount: PublicKey; step: SolanaFlowStep } {
  const buyTokenAccount = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, programId)

  return {
    buyTokenAccount,
    step: planCreateBuyAtaStep({
      payer: PAYER,
      receiver: RECEIVER,
      quote: { intent: { buyMint: BUY_MINT, buyTokenAccount }, buyTokenProgramId: programId } as PlanQuote,
      buySymbol: 'WSOL',
    }),
  }
}

describe('planCreateBuyAtaStep', () => {
  it('creates the exact account the order credits, paid for by the payer', () => {
    const { step, buyTokenAccount } = planFor(TOKEN_PROGRAM_ID)

    const [instruction] = step.instructions
    const [payer, ata, , mint] = instruction.keys

    expect(instruction.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)).toBe(true)
    expect(payer.pubkey.equals(PAYER)).toBe(true)
    expect(ata.pubkey.equals(buyTokenAccount)).toBe(true)
    expect(mint.pubkey.equals(BUY_MINT)).toBe(true)
  })

  it('owns the account by the receiver, not the payer, so a custom recipient can be credited', () => {
    const { step } = planFor(TOKEN_PROGRAM_ID)

    const [, , owner] = step.instructions[0].keys

    expect(owner.pubkey.equals(RECEIVER)).toBe(true)
    expect(owner.pubkey.equals(PAYER)).toBe(false)
  })

  it('is idempotent, so an already-created account is a no-op rather than a failed transaction', () => {
    const { step } = planFor(TOKEN_PROGRAM_ID)

    // Instruction discriminator 1 is CreateIdempotent; a plain Create (0) would abort the whole bundle
    // when the receiver already holds the token.
    expect(step.instructions[0].data[0]).toBe(1)
  })

  it('targets the Token-2022 account for a Token-2022 mint', () => {
    const { step, buyTokenAccount } = planFor(TOKEN_2022_PROGRAM_ID)
    const classic = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, TOKEN_PROGRAM_ID)

    expect(step.instructions[0].keys[1].pubkey.equals(buyTokenAccount)).toBe(true)
    expect(buyTokenAccount.equals(classic)).toBe(false)
  })
})
