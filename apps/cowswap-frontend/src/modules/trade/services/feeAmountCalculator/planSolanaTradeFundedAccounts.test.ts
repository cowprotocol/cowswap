/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { planSolanaTradeFundedAccounts } from './planSolanaTradeFundedAccounts'

import { getWsolAssociatedTokenAccount } from '../wrapNativeSolana/const'

import type { BuyAtaQuote } from '../solanaFlow/planCreateBuyAtaStep'

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const RECEIVER = new PublicKey('5k75h1UBx8gJp6kTkPcbkgAgPmrPBiLHLLXmzMfVsBEZ')
const BUY_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

/** The owner's own associated address, which the driver creates at settle — so the bundle never does. */
function quoteFor(programId: PublicKey): BuyAtaQuote {
  const buyTokenAccount = getAssociatedTokenAddressSync(BUY_MINT, OWNER, false, programId)

  return { intent: { buyMint: BUY_MINT, buyTokenAccount }, buyTokenProgramId: programId } as BuyAtaQuote
}

/** A custom receiver's account, which the driver was never told about and the bundle has to create. */
function receiverQuoteFor(programId: PublicKey): BuyAtaQuote {
  const buyTokenAccount = getAssociatedTokenAddressSync(BUY_MINT, RECEIVER, false, programId)

  return { intent: { buyMint: BUY_MINT, buyTokenAccount }, buyTokenProgramId: programId } as BuyAtaQuote
}

describe('planSolanaTradeFundedAccounts', () => {
  it('declares the wrapped-SOL account and the order PDA on a native sell', () => {
    const accounts = planSolanaTradeFundedAccounts({
      owner: OWNER,
      quote: quoteFor(TOKEN_PROGRAM_ID),
      isNativeSell: true,
    })

    expect(accounts).toHaveLength(2)
    expect(accounts[0].address?.equals(getWsolAssociatedTokenAccount(OWNER))).toBe(true)
    expect(accounts[1].address).toBeUndefined()
  })

  // A native-SOL buy creates no token account (settlement pays lamports). Without this skip the
  // pre-flight would try to unpack the System Program sentinel as a mint, throw, and silently
  // disable the shortfall check for every buy-native trade.
  it('declares only the order PDA on a native buy, mirroring the skipped buy-ATA step', () => {
    const nativeQuote = {
      intent: { buyMint: new PublicKey(NATIVE_CURRENCIES[SupportedChainId.SOLANA].address), buyTokenAccount: OWNER },
      buyTokenProgramId: undefined,
    } as BuyAtaQuote

    const accounts = planSolanaTradeFundedAccounts({ owner: OWNER, quote: nativeQuote, isNativeSell: false })

    expect(accounts).toHaveLength(1)
    expect(accounts[0].address).toBeUndefined()
  })

  it('drops the wrapped-SOL account when the sell token is not native', () => {
    const accounts = planSolanaTradeFundedAccounts({
      owner: OWNER,
      quote: receiverQuoteFor(TOKEN_PROGRAM_ID),
      isNativeSell: false,
    })

    expect(accounts).toHaveLength(2)
    expect(accounts.some(({ address }) => address?.equals(getWsolAssociatedTokenAccount(OWNER)))).toBe(false)
  })

  // The rent gates the trade button and the MAX reserve: still pricing an account the bundle no
  // longer creates would refuse trades the wallet can afford.
  it('drops the buy-token account when the driver creates it', () => {
    const accounts = planSolanaTradeFundedAccounts({
      owner: OWNER,
      quote: quoteFor(TOKEN_PROGRAM_ID),
      isNativeSell: false,
    })

    expect(accounts).toHaveLength(1)
    expect(accounts[0].address).toBeUndefined()
  })

  it('keeps the buy-token account of a custom receiver, which the driver cannot create', () => {
    const quote = receiverQuoteFor(TOKEN_PROGRAM_ID)

    const accounts = planSolanaTradeFundedAccounts({ owner: OWNER, quote, isNativeSell: false })

    expect(accounts).toHaveLength(2)
    expect(accounts[0].address?.equals(quote.intent.buyTokenAccount)).toBe(true)
  })

  // The rent depends on the account's size, and a Token-2022 mint's extensions decide it, so the
  // quote's program has to reach `size` rather than being assumed. Priced against a custom receiver:
  // the owner's own account is the driver's to create, so it never reaches `size` at all.
  it.each([
    ['a Token-2022 mint', TOKEN_2022_PROGRAM_ID],
    ['a classic SPL mint', TOKEN_PROGRAM_ID],
  ])("resolves the buy account's size with %s's own token program", (_label, programId) => {
    const accounts = planSolanaTradeFundedAccounts({
      owner: OWNER,
      quote: receiverQuoteFor(programId),
      isNativeSell: false,
    })

    const { size } = accounts[0]

    if (typeof size === 'number') throw new Error('Buy-token account size must be resolved from its mint')

    expect(size.mint.equals(BUY_MINT)).toBe(true)
    expect(size.tokenProgramId.equals(programId)).toBe(true)
  })
})
