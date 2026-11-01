jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  buildSolanaSwapOrder: jest.fn(),
}))

import { bytesToHex } from 'viem'

import { SigningScheme } from '@cowprotocol/cow-sdk'
import { buildSolanaSwapOrder, SolanaSwapOrder, SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { planCreateOrderStep } from './planCreateOrderStep'

const mockBuildSolanaSwapOrder = buildSolanaSwapOrder as jest.MockedFunction<typeof buildSolanaSwapOrder>

const APP_DATA_DOC = {
  version: '1.6.0',
  appCode: 'CoW Swap',
  environment: 'production',
  metadata: { orderClass: { orderClass: 'market' as const } },
}

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

const SIGNED_APP_DATA_BYTES = new Uint8Array(32).fill(0xcd)
const SIGNED_SELL_AMOUNT = 1_234_567n
const SIGNED_BUY_AMOUNT = 7_654_321n

const builtOrder = {
  instruction: 'CREATE_ORDER_IX',
  orderId: '0xdeadbeef',
  signingScheme: SigningScheme.PRESIGN,
  intent: { appData: SIGNED_APP_DATA_BYTES, sellAmount: SIGNED_SELL_AMOUNT, buyAmount: SIGNED_BUY_AMOUNT },
} as unknown as SolanaSwapOrder

describe('planCreateOrderStep', () => {
  beforeEach(() => {
    mockBuildSolanaSwapOrder.mockReset()
    mockBuildSolanaSwapOrder.mockResolvedValue(builtOrder)
  })

  it('delegates instruction building to the SDK', async () => {
    const { step } = await planCreateOrderStep({
      ...quote,
      appDataDoc: APP_DATA_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(
      {
        quoteResults: quote.quoteResults,
        solanaQuote: quote.solanaQuote,
      },
      {
        quoteRequest: { validTo: VALID_TO },
        appData: APP_DATA_DOC,
      },
      { sponsor: undefined },
    )
    expect(step.instructions).toEqual(['CREATE_ORDER_IX'])
  })

  it('carries the order identity out of the same call that built the instruction', async () => {
    // Not derived from `solanaQuote.uid`: a receiver/validTo override re-derives it inside the SDK.
    const { orderId, signingScheme } = await planCreateOrderStep({
      ...quote,
      appDataDoc: APP_DATA_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(orderId).toBe('0xdeadbeef')
    expect(signingScheme).toBe(SigningScheme.PRESIGN)
  })

  // The fee payer decides who the transaction must name, and a sponsored order is the only case where
  // it is not the owner.
  it('passes the sponsor through and reports it as the fee payer', async () => {
    const sponsor = new PublicKey(new Uint8Array(32).fill(0x99))
    mockBuildSolanaSwapOrder.mockResolvedValue({ ...builtOrder, feePayer: sponsor } as unknown as SolanaSwapOrder)

    const { feePayer } = await planCreateOrderStep({
      ...quote,
      appDataDoc: APP_DATA_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
      sponsor,
    })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(expect.anything(), expect.anything(), { sponsor })
    expect(feePayer).toBe(sponsor)
  })

  // Without this the instruction inherits the quote's own TTL, so the on-chain order expires at a time
  // the UI never showed — the deadline setting appears to be ignored.
  it("applies the user's deadline to the instruction, not just to the local order", async () => {
    await planCreateOrderStep({
      ...quote,
      appDataDoc: APP_DATA_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ quoteRequest: expect.objectContaining({ validTo: VALID_TO }) }),
      expect.anything(),
    )
  })

  it("signs the app's appData doc, and builds the order at the quote's own price", async () => {
    await planCreateOrderStep({
      ...quote,
      appDataDoc: APP_DATA_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        appData: expect.objectContaining({ metadata: { orderClass: { orderClass: 'market' } } }),
      }),
      expect.anything(),
    )
  })

  // buildSolanaOrder() in solanaFlow/index.ts needs the bytes actually signed to record on the local
  // order — the quote's own OrderParameters.appData is a meaningless stub for Solana (see getSolanaQuote.ts).
  it('returns the actually-signed appData as a 0x-prefixed hex string', async () => {
    const { appData } = await planCreateOrderStep({
      ...quote,
      appDataDoc: APP_DATA_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(appData).toBe(bytesToHex(SIGNED_APP_DATA_BYTES))
  })

  // buildSolanaOrder() needs the amounts actually encoded into the instruction, not the quote's own —
  // for a swap these happen to match (no price override), but the local order must read them from here.
  it('returns the actually-signed sellAmount/buyAmount from the built intent', async () => {
    const { sellAmount, buyAmount } = await planCreateOrderStep({
      ...quote,
      appDataDoc: APP_DATA_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(sellAmount).toBe(SIGNED_SELL_AMOUNT)
    expect(buyAmount).toBe(SIGNED_BUY_AMOUNT)
  })

  it('summarises the swap with both symbols', async () => {
    const { step } = await planCreateOrderStep({
      ...quote,
      appDataDoc: APP_DATA_DOC,
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(step.summary).toContain('SOL')
    expect(step.summary).toContain('USDC')
  })

  it('propagates an SDK failure instead of sending a partial bundle', async () => {
    mockBuildSolanaSwapOrder.mockRejectedValue(new Error('bad receiver'))

    await expect(
      planCreateOrderStep({
        ...quote,
        appDataDoc: APP_DATA_DOC,
        sellSymbol: 'SOL',
        buySymbol: 'USDC',
        validTo: VALID_TO,
      }),
    ).rejects.toThrow('bad receiver')
  })
})
