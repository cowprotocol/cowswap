/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { decodeSyncNativeInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey, SystemInstruction } from '@solana/web3.js'

import { planWrapStep } from './planWrapStep'

import { WSOL_MINT } from '../wrapNativeSolana/const'

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const ata = getAssociatedTokenAddressSync(WSOL_MINT, OWNER, false, TOKEN_PROGRAM_ID)

function createConnection({
  accountExists,
  rentExemptLamports = 9_000,
}: {
  accountExists: boolean
  rentExemptLamports?: number
}): Connection {
  return {
    getAccountInfo: jest.fn().mockResolvedValue(accountExists ? {} : null),
    getMinimumBalanceForRentExemption: jest.fn().mockResolvedValue(rentExemptLamports),
  } as unknown as Connection
}

describe('planWrapStep', () => {
  it('returns null for a non-positive amount', async () => {
    const connection = createConnection({ accountExists: true })

    expect(await planWrapStep({ connection, owner: OWNER, sellAmount: 0n })).toBeNull()
  })

  it('transfers exactly the sell amount when the WSOL account already exists', async () => {
    const connection = createConnection({ accountExists: true })

    const step = await planWrapStep({ connection, owner: OWNER, sellAmount: 10_000n })

    const [, transfer] = step!.instructions
    expect(SystemInstruction.decodeTransfer(transfer).lamports).toBe(10_000n)
  })

  it('grows the transfer by the rent-exempt deposit when the WSOL account does not exist yet, so exactly the sell amount lands as WSOL', async () => {
    const connection = createConnection({ accountExists: false, rentExemptLamports: 9_000 })

    const step = await planWrapStep({ connection, owner: OWNER, sellAmount: 10_000n })

    const [, transfer, syncNative] = step!.instructions
    expect(SystemInstruction.decodeTransfer(transfer).lamports).toBe(19_000n)
    expect(decodeSyncNativeInstruction(syncNative, TOKEN_PROGRAM_ID).keys.account.pubkey.equals(ata)).toBe(true)
  })

  it('summarizes the SOL amount wrapped', async () => {
    const connection = createConnection({ accountExists: true })

    const step = await planWrapStep({ connection, owner: OWNER, sellAmount: 10_000n })

    expect(step!.summary).toBe('Wrap 0.00001 SOL')
  })
})
