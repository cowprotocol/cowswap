/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { findBufferPda } from '@cowprotocol/sdk-trading-solana'

import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, SystemProgram } from '@solana/web3.js'

import { planCreateBufferStep } from './planCreateBufferStep'

import type { PlanCreateBufferStepParams } from './planCreateBufferStep'

type PlanQuote = PlanCreateBufferStepParams['quote']

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const PROGRAM_ID = new PublicKey('C7PXyLpLQBh3Ce7e9DNj3rDVUvwqa5orDwQG5hs1rfNi')
const BUY_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const NATIVE_SOL_MINT = NATIVE_CURRENCIES[SupportedChainId.SOLANA].address

function planFor(buyMint: PublicKey, buyTokenProgramId?: PublicKey): ReturnType<typeof planCreateBufferStep> {
  return planCreateBufferStep({
    payer: OWNER,
    quote: { intent: { buyMint }, buyTokenProgramId, programId: PROGRAM_ID } as PlanQuote,
    buySymbol: 'USDC',
  })
}

describe('planCreateBufferStep', () => {
  it('creates the buffer settlement pays this order out of', () => {
    const step = planFor(BUY_MINT)
    const [bufferPda] = findBufferPda(PROGRAM_ID, BUY_MINT)

    const instruction = step?.instructions[0]
    expect(instruction?.programId.equals(PROGRAM_ID)).toBe(true)
    expect(instruction?.keys[3]?.pubkey.equals(bufferPda)).toBe(true)
    expect(instruction?.keys[4]?.pubkey.equals(BUY_MINT)).toBe(true)
  })

  it('has the owner pay the rent, since a buffer is never subsidised', () => {
    const payer = planFor(BUY_MINT)?.instructions[0]?.keys[0]

    expect(payer?.pubkey.equals(OWNER)).toBe(true)
    expect(payer?.isSigner).toBe(true)
  })

  it('defaults to the classic SPL Token program when the quote resolved none', () => {
    const tokenProgram = planFor(BUY_MINT)?.instructions[0]?.keys[2]

    expect(tokenProgram?.pubkey.equals(TOKEN_PROGRAM_ID)).toBe(true)
  })

  it('creates the buffer under Token-2022 for a Token-2022 mint', () => {
    const tokenProgram = planFor(BUY_MINT, TOKEN_2022_PROGRAM_ID)?.instructions[0]?.keys[2]

    expect(tokenProgram?.pubkey.equals(TOKEN_2022_PROGRAM_ID)).toBe(true)
  })

  // A native-SOL buy is paid as lamports from the settlement state PDA, so there is no buffer. The
  // sentinel is the System Program address, and opening a token account for it would abort the bundle.
  it('plans nothing for a native SOL buy', () => {
    expect(planFor(new PublicKey(NATIVE_SOL_MINT))).toBeNull()
    expect(new PublicKey(NATIVE_SOL_MINT).equals(SystemProgram.programId)).toBe(true)
  })
})
