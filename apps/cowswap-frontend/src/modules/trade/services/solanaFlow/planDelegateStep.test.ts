/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { TokenWithLogo } from '@cowprotocol/common-const'

import { PublicKey } from '@solana/web3.js'

import { planDelegateStep } from './planDelegateStep'

import { buildApproveInstruction } from '../solanaApprove/buildApproveInstruction'

// Avoids `@cowprotocol/tokens` (pulled in via balances-and-allowances), which reads `window.location` at import time.
jest.mock('@cowprotocol/balances-and-allowances', () => ({
  findSolanaSettlementStatePda: jest.fn(() => 'SETTLEMENT_PDA'),
}))

jest.mock('../solanaApprove/buildApproveInstruction', () => ({
  buildApproveInstruction: jest.fn(() => 'APPROVE_IX'),
}))

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
const TOKEN = {
  address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  symbol: 'WSOL',
  tags: [],
} as unknown as TokenWithLogo

const mockBuildApprove = buildApproveInstruction as jest.Mock

beforeEach(() => jest.clearAllMocks())

describe('planDelegateStep', () => {
  it('returns null for a non-positive amount', () => {
    expect(planDelegateStep({ owner: OWNER, token: TOKEN, amount: 0n, currentDelegation: 0n })).toBeNull()
    expect(mockBuildApprove).not.toHaveBeenCalled()
  })

  it('returns null when the existing delegation already covers the amount', () => {
    expect(planDelegateStep({ owner: OWNER, token: TOKEN, amount: 500n, currentDelegation: 500n })).toBeNull()
    expect(mockBuildApprove).not.toHaveBeenCalled()
  })

  it('builds an approve instruction when the existing delegation falls short', () => {
    const step = planDelegateStep({ owner: OWNER, token: TOKEN, amount: 500n, currentDelegation: 100n })

    expect(step?.instructions).toEqual(['APPROVE_IX'])
    expect(mockBuildApprove).toHaveBeenCalledWith(expect.objectContaining({ owner: OWNER, amount: 500n }))
  })

  it('summarizes with the token symbol', () => {
    const step = planDelegateStep({ owner: OWNER, token: TOKEN, amount: 500n, currentDelegation: 0n })

    expect(step?.summary).toBe('Approve WSOL')
  })
})
