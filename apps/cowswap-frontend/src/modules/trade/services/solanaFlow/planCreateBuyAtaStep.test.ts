/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { getIsBuyAtaCreationSkipped, planCreateBuyAtaStep } from './planCreateBuyAtaStep'
import { SolanaFlowStep } from './types'

import type { PlanCreateBuyAtaStepParams } from './planCreateBuyAtaStep'

type PlanQuote = PlanCreateBuyAtaStepParams['quote']

const PAYER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const RECEIVER = new PublicKey('5k75h1UBx8gJp6kTkPcbkgAgPmrPBiLHLLXmzMfVsBEZ')
const BUY_MINT = new PublicKey('So11111111111111111111111111111111111111112')
/** The System Program address, which the settlement program reads as "pay native SOL". */
const NATIVE_SOL_MINT = NATIVE_CURRENCIES[SupportedChainId.SOLANA].address

function planFor(programId?: PublicKey): { buyTokenAccount: PublicKey; step: SolanaFlowStep } {
  const buyTokenAccount = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, programId)

  const step = planCreateBuyAtaStep({
    payer: PAYER,
    receiver: RECEIVER,
    quote: { intent: { buyMint: BUY_MINT, buyTokenAccount }, buyTokenProgramId: programId } as PlanQuote,
    buySymbol: 'WSOL',
  })

  if (!step) {
    throw new Error('expected an ATA step: WSOL is a mint, not the native sentinel')
  }

  return { buyTokenAccount, step }
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

  // Settlement pays a native-SOL buy out as lamports on the receiver's own account. Creating an
  // associated token account for the System Program address would add an instruction that credits
  // something the order never names, and cost the user its rent.
  it('plans nothing for a native SOL buy, which has no token account', () => {
    const step = planCreateBuyAtaStep({
      payer: PAYER,
      receiver: RECEIVER,
      quote: {
        intent: { buyMint: new PublicKey(NATIVE_SOL_MINT), buyTokenAccount: RECEIVER },
        buyTokenProgramId: undefined,
      } as PlanQuote,
      buySymbol: 'SOL',
    })

    expect(step).toBeNull()
  })

  it('targets the Token-2022 account for a Token-2022 mint', () => {
    const { step, buyTokenAccount } = planFor(TOKEN_2022_PROGRAM_ID)
    const classic = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, TOKEN_PROGRAM_ID)

    expect(step.instructions[0].keys[1].pubkey.equals(buyTokenAccount)).toBe(true)
    expect(buyTokenAccount.equals(classic)).toBe(false)
  })

  it('plans nothing when the creation is left to the driver', () => {
    const buyTokenAccount = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, TOKEN_PROGRAM_ID)

    const step = planCreateBuyAtaStep({
      payer: PAYER,
      receiver: RECEIVER,
      quote: {
        intent: { buyMint: BUY_MINT, buyTokenAccount },
        buyTokenProgramId: TOKEN_PROGRAM_ID,
      } as PlanQuote,
      buySymbol: 'WSOL',
      isCreationSkipped: true,
    })

    expect(step).toBeNull()
  })
})

describe('getIsBuyAtaCreationSkipped', () => {
  function quoteForOwner(owner: PublicKey, programId = TOKEN_PROGRAM_ID): PlanQuote {
    return {
      intent: { buyMint: BUY_MINT, buyTokenAccount: getAssociatedTokenAddressSync(BUY_MINT, owner, false, programId) },
      buyTokenProgramId: programId,
    } as PlanQuote
  }

  it('leaves the account to the driver when the order pays out to the owner', () => {
    const isSkipped = getIsBuyAtaCreationSkipped({
      quote: quoteForOwner(PAYER),
      owner: PAYER,
      isAtaCreationDisabled: true,
    })

    expect(isSkipped).toBe(true)
  })

  it('keeps the creation while the flag is off', () => {
    const isSkipped = getIsBuyAtaCreationSkipped({
      quote: quoteForOwner(PAYER),
      owner: PAYER,
      isAtaCreationDisabled: false,
    })

    expect(isSkipped).toBe(false)
  })

  // Placement refuses an order paying out to another wallet's missing account: the driver only
  // derives the owner's own associated address, so nothing on its side can create that one.
  it('keeps the creation for a custom receiver', () => {
    const isSkipped = getIsBuyAtaCreationSkipped({
      quote: quoteForOwner(RECEIVER),
      owner: PAYER,
      isAtaCreationDisabled: true,
    })

    expect(isSkipped).toBe(false)
  })

  it('keeps the creation when the account sits under a different token program', () => {
    const isSkipped = getIsBuyAtaCreationSkipped({
      quote: { ...quoteForOwner(PAYER, TOKEN_2022_PROGRAM_ID), buyTokenProgramId: TOKEN_PROGRAM_ID } as PlanQuote,
      owner: PAYER,
      isAtaCreationDisabled: true,
    })

    expect(isSkipped).toBe(false)
  })
})
