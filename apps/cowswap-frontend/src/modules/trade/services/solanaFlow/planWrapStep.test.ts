/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, SystemInstruction } from '@solana/web3.js'

import { planWrapStep } from './planWrapStep'

import { WSOL_MINT } from '../wrapNativeSolana/const'

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const ata = getAssociatedTokenAddressSync(WSOL_MINT, OWNER, false, TOKEN_PROGRAM_ID)

describe('planWrapStep', () => {
  it('returns null for a non-positive amount', () => {
    expect(planWrapStep({ owner: OWNER, sellAmount: 0n })).toBeNull()
  })

  it('transfers exactly the sell amount, regardless of whether the WSOL account already exists', () => {
    const step = planWrapStep({ owner: OWNER, sellAmount: 10_000n })

    const [, transfer] = step!.instructions
    const decoded = SystemInstruction.decodeTransfer(transfer)
    expect(decoded.lamports).toBe(10_000n)
    expect(decoded.toPubkey.equals(ata)).toBe(true)
  })

  it('summarizes the SOL amount wrapped', () => {
    const step = planWrapStep({ owner: OWNER, sellAmount: 10_000n })

    expect(step!.summary).toBe('Wrap 0.00001 SOL')
  })
})
