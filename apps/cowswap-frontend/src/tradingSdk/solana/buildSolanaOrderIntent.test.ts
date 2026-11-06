/**
 * PublicKey.isOnCurve misreports every point as on-curve under jsdom, exhausting findProgramAddressSync's bumps.
 * @jest-environment node
 */
import { bytesToHex } from 'viem'

import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { buildSolanaLimitOrderOrder, encodeOrderIntent, SolanaLimitOrderParams } from '@cowprotocol/sdk-trading-solana'

import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

import { buildSolanaOrderIntent, SolanaIntentOrder } from './buildSolanaOrderIntent'

const OWNER = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
const RECEIVER = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const TOKEN_2022_MINT = '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo'
const NATIVE_SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA].address
const WSOL = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address
const APP_DATA = new Uint8Array(32).fill(7)

const baseParams: SolanaLimitOrderParams = {
  ownerAddress: OWNER,
  receiverAddress: RECEIVER,
  sellTokenAddress: USDC_MINT,
  buyTokenAddress: WSOL,
  sellAmount: 1_000_000n,
  buyAmount: 5_000_000n,
  kind: OrderKind.SELL,
  validTo: 1_900_000_000,
  partiallyFillable: false,
  appData: APP_DATA,
}

async function createOrder(
  params: Partial<SolanaLimitOrderParams> = {},
): Promise<{ order: SolanaIntentOrder; intentBytes: Uint8Array }> {
  const full = { ...baseParams, ...params }
  const { orderId, intent } = await buildSolanaLimitOrderOrder(full)

  return {
    order: {
      id: orderId,
      owner: OWNER,
      receiver: full.receiverAddress?.toString(),
      sellToken: full.sellTokenAddress.toString(),
      buyToken: full.buyTokenAddress.toString(),
      sellAmount: full.sellAmount.toString(),
      buyAmount: full.buyAmount.toString(),
      validTo: full.validTo,
      kind: full.kind,
      partiallyFillable: full.partiallyFillable,
      appData: bytesToHex(full.appData),
    },
    intentBytes: encodeOrderIntent(intent),
  }
}

describe('buildSolanaOrderIntent', () => {
  it.each([
    ['classic SPL tokens', {}],
    ['a Token-2022 buy mint', { buyTokenAddress: TOKEN_2022_MINT, buyTokenProgramId: TOKEN_2022_PROGRAM_ID }],
    ['a Token-2022 sell mint', { sellTokenAddress: TOKEN_2022_MINT, sellTokenProgramId: TOKEN_2022_PROGRAM_ID }],
    ['a native SOL buy', { buyTokenAddress: NATIVE_SOL }],
    ['a native SOL sell', { sellTokenAddress: NATIVE_SOL, buyTokenAddress: USDC_MINT }],
  ])('rebuilds the signed intent for %s', async (_, params) => {
    const { order, intentBytes } = await createOrder(params)

    const intent = await buildSolanaOrderIntent(order)

    expect(intent).toBeDefined()
    expect(encodeOrderIntent(intent as NonNullable<typeof intent>)).toEqual(intentBytes)
  })

  it('defaults the receiver to the owner', async () => {
    const { order, intentBytes } = await createOrder({ receiverAddress: undefined })

    const intent = await buildSolanaOrderIntent({ ...order, receiver: undefined })

    expect(intent && encodeOrderIntent(intent)).toEqual(intentBytes)
  })

  it('returns undefined when the stored fields do not hash to the order id', async () => {
    const { order } = await createOrder()

    expect(await buildSolanaOrderIntent({ ...order, buyAmount: '1' })).toBeUndefined()
  })

  it('returns undefined when appData is not 32 bytes of hex', async () => {
    const { order } = await createOrder()

    expect(await buildSolanaOrderIntent({ ...order, appData: '{}' })).toBeUndefined()
  })
})
