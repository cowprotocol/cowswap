jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  buildCreateOrderInstruction: jest.fn(() => 'CREATE_ORDER_IX'),
}))

import { buildCreateOrderInstruction, SolanaQuote } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { planCreateOrderStep } from './planCreateOrderStep'

const mockBuildCreateOrderInstruction = buildCreateOrderInstruction as jest.MockedFunction<
  typeof buildCreateOrderInstruction
>

const owner = new PublicKey(new Uint8Array(32).fill(9))
const orderPda = new PublicKey(new Uint8Array(32).fill(4))
const programId = new PublicKey(new Uint8Array(32).fill(5))

const solanaQuote = {
  programId,
  orderPda,
  intent: { owner },
} as unknown as SolanaQuote

describe('planCreateOrderStep', () => {
  beforeEach(() => {
    mockBuildCreateOrderInstruction.mockClear()
  })

  it('builds the CreateOrder instruction from the quote', () => {
    const result = planCreateOrderStep({ solanaQuote, sellSymbol: 'SOL', buySymbol: 'USDC' })

    expect(mockBuildCreateOrderInstruction).toHaveBeenCalledWith({
      programId,
      owner,
      createdBy: owner,
      orderPda,
      intent: solanaQuote.intent,
    })
    expect(result.instructions).toEqual(['CREATE_ORDER_IX'])
  })

  it('summarises the swap with both symbols', () => {
    const { summary } = planCreateOrderStep({ solanaQuote, sellSymbol: 'SOL', buySymbol: 'USDC' })

    expect(summary).toContain('SOL')
    expect(summary).toContain('USDC')
  })

  it('funds the order rent from the owner, so a single wallet signs the whole transaction', () => {
    planCreateOrderStep({ solanaQuote, sellSymbol: 'SOL', buySymbol: 'USDC' })

    const { owner: calledOwner, createdBy } = mockBuildCreateOrderInstruction.mock.calls[0][0]

    expect(createdBy).toBe(calledOwner)
  })
})
