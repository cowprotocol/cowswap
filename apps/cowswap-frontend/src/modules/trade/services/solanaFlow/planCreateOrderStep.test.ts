jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  buildSolanaSwapOrder: jest.fn(),
}))

import { SigningScheme } from '@cowprotocol/cow-sdk'
import { buildSolanaSwapOrder, SolanaSwapOrder, SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { planCreateOrderStep } from './planCreateOrderStep'

const mockBuildSolanaSwapOrder = buildSolanaSwapOrder as jest.MockedFunction<typeof buildSolanaSwapOrder>

const quote = {
  quoteResults: {},
  solanaQuote: {
    programId: new PublicKey(new Uint8Array(32).fill(5)),
    orderPda: new PublicKey(new Uint8Array(32).fill(4)),
    uid: new Uint8Array(32).fill(7),
    intent: { owner: new PublicKey(new Uint8Array(32).fill(9)) },
  },
} as unknown as SolanaSwapOrderQuote

const builtOrder = {
  instruction: 'CREATE_ORDER_IX',
  orderId: '0xdeadbeef',
  signingScheme: SigningScheme.PRESIGN,
} as unknown as SolanaSwapOrder

describe('planCreateOrderStep', () => {
  beforeEach(() => {
    mockBuildSolanaSwapOrder.mockReset()
    mockBuildSolanaSwapOrder.mockResolvedValue(builtOrder)
  })

  it('delegates instruction building to the SDK', async () => {
    const { step } = await planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC' })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith({
      quoteResults: quote.quoteResults,
      solanaQuote: quote.solanaQuote,
    })
    expect(step.instructions).toEqual(['CREATE_ORDER_IX'])
  })

  it('carries the order identity out of the same call that built the instruction', async () => {
    // Not derived from `solanaQuote.uid`: a receiver/validTo override re-derives it inside the SDK.
    const { orderId, signingScheme } = await planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC' })

    expect(orderId).toBe('0xdeadbeef')
    expect(signingScheme).toBe(SigningScheme.PRESIGN)
  })

  it('summarises the swap with both symbols', async () => {
    const { step } = await planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC' })

    expect(step.summary).toContain('SOL')
    expect(step.summary).toContain('USDC')
  })

  it('propagates an SDK failure instead of sending a partial bundle', async () => {
    mockBuildSolanaSwapOrder.mockRejectedValue(new Error('bad receiver'))

    await expect(planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC' })).rejects.toThrow(
      'bad receiver',
    )
  })
})
