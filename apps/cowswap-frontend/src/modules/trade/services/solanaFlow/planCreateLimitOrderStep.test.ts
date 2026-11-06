jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  buildSolanaLimitOrderOrder: jest.fn(),
}))

import { hexToBytes } from 'viem'

import { OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'
import { buildSolanaLimitOrderOrder, SolanaSwapOrder } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { planCreateLimitOrderStep, PlanCreateLimitOrderStepParams } from './planCreateLimitOrderStep'

const mockBuildSolanaLimitOrderOrder = buildSolanaLimitOrderOrder as jest.MockedFunction<
  typeof buildSolanaLimitOrderOrder
>

const APP_DATA_HASH = '0x' + 'ab'.repeat(32)

const OWNER = new PublicKey(new Uint8Array(32).fill(1))
const SELL_MINT = new PublicKey(new Uint8Array(32).fill(2))
const BUY_MINT = new PublicKey(new Uint8Array(32).fill(3))
const VALID_TO = 1_700_000_600

function buildParams(overrides: Partial<PlanCreateLimitOrderStepParams> = {}): PlanCreateLimitOrderStepParams {
  return {
    ownerAddress: OWNER,
    sellTokenAddress: SELL_MINT,
    buyTokenAddress: BUY_MINT,
    sellAmount: 111n,
    buyAmount: 222n,
    kind: OrderKind.SELL,
    validTo: VALID_TO,
    partiallyFillable: false,
    appDataHash: APP_DATA_HASH,
    sellSymbol: 'SOL',
    buySymbol: 'USDC',
    ...overrides,
  }
}

const SIGNED_SELL_AMOUNT = 111n
const SIGNED_BUY_AMOUNT = 222n

const builtOrder = {
  instruction: 'CREATE_LIMIT_ORDER_IX',
  orderId: '0xdeadbeef',
  signingScheme: SigningScheme.PRESIGN,
  intent: {
    appData: hexToBytes(APP_DATA_HASH as `0x${string}`),
    sellAmount: SIGNED_SELL_AMOUNT,
    buyAmount: SIGNED_BUY_AMOUNT,
  },
} as unknown as SolanaSwapOrder

describe('planCreateLimitOrderStep', () => {
  beforeEach(() => {
    mockBuildSolanaLimitOrderOrder.mockReset()
    mockBuildSolanaLimitOrderOrder.mockResolvedValue(builtOrder)
  })

  it("passes the caller's own sellAmount/buyAmount straight through, unmodified", async () => {
    await planCreateLimitOrderStep(buildParams({ sellAmount: 999n, buyAmount: 888n }))

    expect(mockBuildSolanaLimitOrderOrder).toHaveBeenCalledWith(
      expect.objectContaining({ sellAmount: 999n, buyAmount: 888n }),
    )
  })

  it('passes ownerAddress, receiverAddress, sellTokenAddress, buyTokenAddress, kind, validTo, and partiallyFillable through unmodified', async () => {
    const receiverAddress = new PublicKey(new Uint8Array(32).fill(9))

    await planCreateLimitOrderStep(buildParams({ receiverAddress, kind: OrderKind.BUY, partiallyFillable: true }))

    expect(mockBuildSolanaLimitOrderOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerAddress: OWNER,
        receiverAddress,
        sellTokenAddress: SELL_MINT,
        buyTokenAddress: BUY_MINT,
        kind: OrderKind.BUY,
        validTo: VALID_TO,
        partiallyFillable: true,
      }),
    )
  })

  it("signs the app's appData hash as the intent's raw bytes", async () => {
    await planCreateLimitOrderStep(buildParams())

    expect(mockBuildSolanaLimitOrderOrder).toHaveBeenCalledWith(
      expect.objectContaining({ appData: hexToBytes(APP_DATA_HASH as `0x${string}`) }),
    )
  })

  it('returns the signed appData as a 0x-prefixed hex string, so the caller can store what was actually signed', async () => {
    const { appData } = await planCreateLimitOrderStep(buildParams())

    expect(appData).toBe(APP_DATA_HASH)
  })

  // buildSolanaOrder() must store the price the user actually signed on-chain, not whatever
  // planCreateOrderStep's quote-derived amounts happened to be — this is the whole point of a limit order.
  it('returns the actually-signed sellAmount/buyAmount from the built intent, not the caller-supplied params', async () => {
    const { sellAmount, buyAmount } = await planCreateLimitOrderStep(buildParams({ sellAmount: 999n, buyAmount: 888n }))

    expect(sellAmount).toBe(SIGNED_SELL_AMOUNT)
    expect(buyAmount).toBe(SIGNED_BUY_AMOUNT)
  })

  it('does not send sellSymbol/buySymbol through to the SDK call — they are UI-only', async () => {
    await planCreateLimitOrderStep(buildParams())

    const [params] = mockBuildSolanaLimitOrderOrder.mock.calls[0]
    expect(params).not.toHaveProperty('sellSymbol')
    expect(params).not.toHaveProperty('buySymbol')
    expect(params).not.toHaveProperty('appDataHash')
  })

  it('summarises the order with both symbols', async () => {
    const { step } = await planCreateLimitOrderStep(buildParams({ sellSymbol: 'SOL', buySymbol: 'USDC' }))

    expect(step.summary).toContain('SOL')
    expect(step.summary).toContain('USDC')
  })

  it('carries the order identity and instruction out of the same call that built it', async () => {
    const { step, orderId, signingScheme } = await planCreateLimitOrderStep(buildParams())

    expect(orderId).toBe('0xdeadbeef')
    expect(signingScheme).toBe(SigningScheme.PRESIGN)
    expect(step.instructions).toEqual(['CREATE_LIMIT_ORDER_IX'])
    expect(step.createdOrderId).toBe('0xdeadbeef')
  })

  // A limit order creates the same order PDA as a swap; without this declaration the pre-flight
  // SOL check prices one rent too few and the wallet rejects the transaction at signing time.
  it('declares the order PDA it creates, so the pre-flight balance check prices its rent', async () => {
    const { step } = await planCreateLimitOrderStep(buildParams())

    expect(step.fundedAccounts).toEqual([{ size: 264 }])
  })

  it('propagates an SDK failure instead of sending a partial bundle', async () => {
    mockBuildSolanaLimitOrderOrder.mockRejectedValue(new Error('bad amount'))

    await expect(planCreateLimitOrderStep(buildParams())).rejects.toThrow('bad amount')
  })
})
