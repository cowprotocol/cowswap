/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { assertIntentCreditsReceiver, IntentReceiverMismatchError } from './assertIntentCreditsReceiver'

import type { BuyAtaQuote } from './planCreateBuyAtaStep'

const RECEIVER = new PublicKey('5k75h1UBx8gJp6kTkPcbkgAgPmrPBiLHLLXmzMfVsBEZ')
const SOMEONE_ELSE = new PublicKey('2c1E71jPXqgM8nJXiQpCEwGhXSVA8GTN4a1qTS1ibyLa')
/** A Squads vault: off the ed25519 curve, so the derivation must allow an off-curve owner. */
const VAULT = new PublicKey('D9DvzXZjyqECswED5YgHi4wA1qTVjjiGP76sN6Dr8vGE')
const BUY_MINT = new PublicKey('So11111111111111111111111111111111111111112')
/** The System Program address, which the settlement program reads as "pay native SOL". */
const NATIVE_SOL_MINT = new PublicKey(NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)

function quoteFor(buyTokenAccount: PublicKey, buyMint = BUY_MINT, buyTokenProgramId?: PublicKey): BuyAtaQuote {
  return { intent: { buyMint, buyTokenAccount }, buyTokenProgramId } as BuyAtaQuote
}

describe('assertIntentCreditsReceiver', () => {
  it('accepts the account the recipient actually owns', () => {
    const ata = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, TOKEN_PROGRAM_ID)

    expect(() => assertIntentCreditsReceiver(quoteFor(ata, BUY_MINT, TOKEN_PROGRAM_ID), RECEIVER)).not.toThrow()
  })

  it('refuses an account belonging to anyone else', () => {
    const ata = getAssociatedTokenAddressSync(BUY_MINT, SOMEONE_ELSE, false, TOKEN_PROGRAM_ID)

    expect(() => assertIntentCreditsReceiver(quoteFor(ata, BUY_MINT, TOKEN_PROGRAM_ID), RECEIVER)).toThrow(
      IntentReceiverMismatchError,
    )
  })

  // Token-2022 derives a different address from the same mint and owner, so the program the quote
  // reported has to reach the derivation or a correct order looks like a redirected one.
  it('derives with the quote token program, not the classic default', () => {
    const ata = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, TOKEN_2022_PROGRAM_ID)

    expect(() => assertIntentCreditsReceiver(quoteFor(ata, BUY_MINT, TOKEN_2022_PROGRAM_ID), RECEIVER)).not.toThrow()
    expect(() => assertIntentCreditsReceiver(quoteFor(ata, BUY_MINT, TOKEN_PROGRAM_ID), RECEIVER)).toThrow(
      IntentReceiverMismatchError,
    )
  })

  // Settlement pays a native buy out as lamports, so the intent names the wallet itself and there is no
  // account to derive.
  it('expects the wallet itself for a native SOL buy', () => {
    expect(() => assertIntentCreditsReceiver(quoteFor(RECEIVER, NATIVE_SOL_MINT), RECEIVER)).not.toThrow()
    expect(() => assertIntentCreditsReceiver(quoteFor(SOMEONE_ELSE, NATIVE_SOL_MINT), RECEIVER)).toThrow(
      IntentReceiverMismatchError,
    )
  })

  // A multisig vault is a program address, and the default derivation guard rejects an off-curve owner
  // outright — the check has to pass for one, not throw before it can compare.
  it('accepts a program-owned recipient', () => {
    const ata = getAssociatedTokenAddressSync(BUY_MINT, VAULT, true, TOKEN_PROGRAM_ID)

    expect(() => assertIntentCreditsReceiver(quoteFor(ata, BUY_MINT, TOKEN_PROGRAM_ID), VAULT)).not.toThrow()
  })

  it('names both accounts so the failure can be read off the message', () => {
    const ata = getAssociatedTokenAddressSync(BUY_MINT, SOMEONE_ELSE, false, TOKEN_PROGRAM_ID)
    const expected = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, TOKEN_PROGRAM_ID)

    expect(() => assertIntentCreditsReceiver(quoteFor(ata, BUY_MINT, TOKEN_PROGRAM_ID), RECEIVER)).toThrow(
      `The order would credit ${ata.toBase58()} instead of the recipient's ${expected.toBase58()}`,
    )
  })
})
