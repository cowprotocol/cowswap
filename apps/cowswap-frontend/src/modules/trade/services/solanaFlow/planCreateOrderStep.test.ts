jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  buildSolanaSwapOrder: jest.fn(),
}))

import { bytesToHex } from 'viem'

import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { SigningScheme } from '@cowprotocol/cow-sdk'
import { buildSolanaSwapOrder, SolanaSwapOrder, SolanaSwapOrderQuote } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { planCreateOrderStep } from './planCreateOrderStep'

const mockBuildSolanaSwapOrder = buildSolanaSwapOrder as jest.MockedFunction<typeof buildSolanaSwapOrder>

// Mirrors the planner's own default so the expectation tracks the source instead of hardcoding
// an environment-dependent value.
const DEFAULT_APP_DATA = {
  appCode: DEFAULT_APP_CODE,
  environment: isBarnBackendEnv ? 'staging' : 'prod',
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
    const { step } = await planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC', validTo: VALID_TO })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(
      {
        quoteResults: quote.quoteResults,
        solanaQuote: quote.solanaQuote,
      },
      {
        quoteRequest: { validTo: VALID_TO },
        appData: { ...DEFAULT_APP_DATA, metadata: { orderClass: { orderClass: 'market' } } },
      },
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

  // This planner only ever builds a swap — a limit order goes through planCreateLimitOrderStep, which
  // never quotes at all — so the order class it marks is always 'market'.
  it("marks the order class as market, and builds the order at the quote's own price", async () => {
    await planCreateOrderStep({ ...quote, sellSymbol: 'SOL', buySymbol: 'USDC', validTo: VALID_TO })

    expect(mockBuildSolanaSwapOrder).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        appData: expect.objectContaining({ metadata: { orderClass: { orderClass: 'market' } } }),
      }),
    )
  })

  // buildSolanaOrder() in solanaFlow/index.ts needs the bytes actually signed to record on the local
  // order — the quote's own OrderParameters.appData is a meaningless stub for Solana (see getSolanaQuote.ts).
  it('returns the actually-signed appData as a 0x-prefixed hex string', async () => {
    const { appData } = await planCreateOrderStep({
      ...quote,
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
      sellSymbol: 'SOL',
      buySymbol: 'USDC',
      validTo: VALID_TO,
    })

    expect(sellAmount).toBe(SIGNED_SELL_AMOUNT)
    expect(buyAmount).toBe(SIGNED_BUY_AMOUNT)
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
