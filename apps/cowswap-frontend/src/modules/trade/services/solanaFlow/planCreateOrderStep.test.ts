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

// The user's deadline, deliberately different from anything the quote would carry.
const VALID_TO = 1_700_000_600

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
    const { step } = await planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC', validTo: VALID_TO })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(
      {
        quoteResults: quote.quoteResults,
        solanaQuote: quote.solanaQuote,
      },
      { quoteRequest: { validTo: VALID_TO } },
    )
    expect(step.instructions).toEqual(['CREATE_ORDER_IX'])
  })

  it('carries the order identity out of the same call that built the instruction', async () => {
    // Not derived from `solanaQuote.uid`: a receiver/validTo override re-derives it inside the SDK.
    const { orderId, signingScheme } = await planCreateOrderStep({
      ...quote,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(orderId).toBe('0xdeadbeef')
    expect(signingScheme).toBe(SigningScheme.PRESIGN)
  })

  // Without this the instruction inherits the quote's own TTL, so the on-chain order expires at a time
  // the UI never showed — the deadline setting appears to be ignored.
  it("applies the user's deadline to the instruction, not just to the local order", async () => {
    await planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC', validTo: VALID_TO })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ quoteRequest: expect.objectContaining({ validTo: VALID_TO }) }),
    )
  })

  it('summarises the swap with both symbols', async () => {
    const { step } = await planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC', validTo: VALID_TO })

    expect(step.summary).toContain('SOL')
    expect(step.summary).toContain('USDC')
  })

  it('propagates an SDK failure instead of sending a partial bundle', async () => {
    mockBuildSolanaSwapOrder.mockRejectedValue(new Error('bad receiver'))

    await expect(
      planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC', validTo: VALID_TO }),
    ).rejects.toThrow('bad receiver')
  })
})
