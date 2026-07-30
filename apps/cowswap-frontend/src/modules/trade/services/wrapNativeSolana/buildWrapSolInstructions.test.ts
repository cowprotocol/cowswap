/**
 * Program-address derivation needs a working ed25519 curve check, and `PublicKey.isOnCurve` misreports
 * every point as on-curve under jsdom — which makes `findProgramAddressSync` exhaust all 255 bumps.
 * @jest-environment node
 */
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  decodeSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, SystemInstruction, SystemProgram } from '@solana/web3.js'

import { buildWrapSolInstructions } from './buildWrapSolInstructions'
import { WSOL_MINT } from './const'

const owner = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const ata = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

describe('buildWrapSolInstructions', () => {
  it('creates the associated token account idempotently before funding it', () => {
    const [createAta] = buildWrapSolInstructions({ owner, lamports: 1n })

    expect(createAta.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)).toBe(true)
    // The idempotent variant is discriminated from the plain one by a `1` byte payload
    expect([...createAta.data]).toEqual([1])
  })

  it('transfers the requested lamports to the associated token account', () => {
    const [, transfer] = buildWrapSolInstructions({ owner, lamports: 12_345n })

    expect(transfer.programId.equals(SystemProgram.programId)).toBe(true)

    const decoded = SystemInstruction.decodeTransfer(transfer)
    expect(decoded.fromPubkey.equals(owner)).toBe(true)
    expect(decoded.toPubkey.equals(ata)).toBe(true)
    expect(decoded.lamports).toBe(12_345n)
  })

  it('syncs the native balance so the token amount matches the transferred lamports', () => {
    const instructions = buildWrapSolInstructions({ owner, lamports: 1n })

    expect(instructions).toHaveLength(3)

    const decoded = decodeSyncNativeInstruction(instructions[2], TOKEN_PROGRAM_ID)
    expect(decoded.keys.account.pubkey.equals(ata)).toBe(true)
  })

  it('rejects a non-positive amount', () => {
    expect(() => buildWrapSolInstructions({ owner, lamports: 0n })).toThrow('Wrap amount must be positive')
  })
})
