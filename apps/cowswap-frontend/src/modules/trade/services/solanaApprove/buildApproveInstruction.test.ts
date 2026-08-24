/**
 * @jest-environment node
 */
import { createApproveInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { buildApproveInstruction } from './buildApproveInstruction'
import { SOLANA_MAX_APPROVE_AMOUNT } from './const'

// The ATA math and instruction encoding are not under test — stub them so we can assert which token
// program, delegate and amount were used, rather than re-implement spl-token.
jest.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: 'TOKEN_PROGRAM_ID',
  TOKEN_2022_PROGRAM_ID: 'TOKEN_2022_PROGRAM_ID',
  getAssociatedTokenAddressSync: jest.fn(() => 'ATA'),
  createApproveInstruction: jest.fn(() => 'APPROVE_IX'),
}))

const OWNER = new PublicKey('So11111111111111111111111111111111111111112')
const MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const DELEGATE = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
const MAX = SOLANA_MAX_APPROVE_AMOUNT

const mockGetAta = getAssociatedTokenAddressSync as jest.Mock
const mockCreateApprove = createApproveInstruction as jest.Mock

function build(isToken2022: boolean, amount = MAX): void {
  buildApproveInstruction({ owner: OWNER, mint: MINT, isToken2022, delegate: DELEGATE, amount })
}

beforeEach(() => jest.clearAllMocks())

describe('buildApproveInstruction', () => {
  it('derives the ATA and approves via the classic token program for a non-Token-2022 mint', () => {
    build(false)

    expect(mockGetAta).toHaveBeenCalledWith(MINT, OWNER, false, 'TOKEN_PROGRAM_ID')
    expect(mockCreateApprove).toHaveBeenCalledWith('ATA', DELEGATE, OWNER, MAX, [], 'TOKEN_PROGRAM_ID')
  })

  it('uses the Token-2022 program for a Token-2022 mint', () => {
    build(true, 123n)

    expect(mockGetAta).toHaveBeenCalledWith(MINT, OWNER, false, 'TOKEN_2022_PROGRAM_ID')
    expect(mockCreateApprove).toHaveBeenCalledWith('ATA', DELEGATE, OWNER, 123n, [], 'TOKEN_2022_PROGRAM_ID')
  })

  it('exposes u64-max as the unlimited approval amount', () => {
    expect(SOLANA_MAX_APPROVE_AMOUNT).toBe(2n ** 64n - 1n)
  })
})
