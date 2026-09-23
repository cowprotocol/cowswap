jest.mock('@cowprotocol/sdk-trading-solana', () => ({
  buildSolanaLimitOrderOrder: jest.fn(),
}))

import { hexToBytes } from 'viem'

import { SOLANA_LIMIT_ORDER_PROD_APP_DATA, SOLANA_LIMIT_ORDER_STAGING_APP_DATA } from '@cowprotocol/common-const'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'
import { buildSolanaLimitOrderOrder, SolanaSwapOrder } from '@cowprotocol/sdk-trading-solana'

import { PublicKey } from '@solana/web3.js'

import { planCreateLimitOrderStep, PlanCreateLimitOrderStepParams } from './planCreateLimitOrderStep'

const mockBuildSolanaLimitOrderOrder = buildSolanaLimitOrderOrder as jest.MockedFunction<
  typeof buildSolanaLimitOrderOrder
>

const EXPECTED_APP_DATA_HEX = isBarnBackendEnv ? SOLANA_LIMIT_ORDER_STAGING_APP_DATA : SOLANA_LIMIT_ORDER_PROD_APP_DATA

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
    sellSymbol: 'SOL',
    buySymbol: 'USDC',
    ...overrides,
  }
}

const builtOrder = {
  instruction: 'CREATE_LIMIT_ORDER_IX',
  orderId: '0xdeadbeef',
  signingScheme: SigningScheme.PRESIGN,
  intent: { appData: hexToBytes(EXPECTED_APP_DATA_HEX as `0x${string}`) },
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

  // Solana has no real appData-doc convention yet — this exact 32-byte constant is the only signal the
  // backend indexer/explorer/this app's own orders table have to recognize a limit order at all.
  it('signs the pre-agreed staging/prod appData constant as raw bytes, picked by env', async () => {
    await planCreateLimitOrderStep(buildParams())

    expect(mockBuildSolanaLimitOrderOrder).toHaveBeenCalledWith(
      expect.objectContaining({ appData: hexToBytes(EXPECTED_APP_DATA_HEX as `0x${string}`) }),
    )
  })

  it('returns the signed appData as a 0x-prefixed hex string, so the caller can store what was actually signed', async () => {
    const { appData } = await planCreateLimitOrderStep(buildParams())

    expect(appData).toBe(EXPECTED_APP_DATA_HEX)
  })

  it('does not send sellSymbol/buySymbol through to the SDK call — they are UI-only', async () => {
    await planCreateLimitOrderStep(buildParams())

    const [params] = mockBuildSolanaLimitOrderOrder.mock.calls[0]
    expect(params).not.toHaveProperty('sellSymbol')
    expect(params).not.toHaveProperty('buySymbol')
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
    expect(step.createsOrder).toBe(true)
  })

  it('propagates an SDK failure instead of sending a partial bundle', async () => {
    mockBuildSolanaLimitOrderOrder.mockRejectedValue(new Error('bad amount'))

    await expect(planCreateLimitOrderStep(buildParams())).rejects.toThrow('bad amount')
  })
})
