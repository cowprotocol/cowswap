/**
 * Program-address derivation needs a working ed25519 curve check, and `PublicKey.isOnCurve` misreports
 * every point as on-curve under jsdom — which makes `findProgramAddressSync` exhaust all 255 bumps.
 * @jest-environment node
 */
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  decodeCloseAccountInstruction,
  decodeSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, SystemInstruction, SystemProgram } from '@solana/web3.js'

import { buildUnwrapSolInstructions } from './buildUnwrapSolInstructions'
import { WSOL_MINT } from './const'

const owner = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const ata = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

describe('buildUnwrapSolInstructions', () => {
  describe('full unwrap', () => {
    it('closes the associated token account and nothing else', () => {
      const instructions = buildUnwrapSolInstructions({ owner, lamports: 1_000n, wsolBalance: 1_000n })

      expect(instructions).toHaveLength(1)

      const decoded = decodeCloseAccountInstruction(instructions[0], TOKEN_PROGRAM_ID)
      expect(decoded.keys.account.pubkey.equals(ata)).toBe(true)
      // Closing returns the wrapped lamports plus the rent-exempt reserve to the owner
      expect(decoded.keys.destination.pubkey.equals(owner)).toBe(true)
      expect(decoded.keys.authority.pubkey.equals(owner)).toBe(true)
    })
  })

  describe('partial unwrap', () => {
    it('closes the account, then re-wraps only the remainder', () => {
      const instructions = buildUnwrapSolInstructions({ owner, lamports: 400n, wsolBalance: 1_000n })

      expect(instructions).toHaveLength(4)

      // Close must come first: it is what turns the whole WSOL balance back into SOL
      decodeCloseAccountInstruction(instructions[0], TOKEN_PROGRAM_ID)

      expect(instructions[1].programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)).toBe(true)
      expect([...instructions[1].data]).toEqual([1])

      expect(instructions[2].programId.equals(SystemProgram.programId)).toBe(true)
      const transfer = SystemInstruction.decodeTransfer(instructions[2])
      expect(transfer.toPubkey.equals(ata)).toBe(true)
      expect(transfer.lamports).toBe(600n)

      const sync = decodeSyncNativeInstruction(instructions[3], TOKEN_PROGRAM_ID)
      expect(sync.keys.account.pubkey.equals(ata)).toBe(true)
    })
  })

  it('rejects unwrapping more than the wrapped balance', () => {
    expect(() => buildUnwrapSolInstructions({ owner, lamports: 1_001n, wsolBalance: 1_000n })).toThrow(
      'Unwrap amount exceeds wrapped balance',
    )
  })

  it('rejects a non-positive amount', () => {
    expect(() => buildUnwrapSolInstructions({ owner, lamports: 0n, wsolBalance: 1_000n })).toThrow(
      'Unwrap amount must be positive',
    )
  })
})
