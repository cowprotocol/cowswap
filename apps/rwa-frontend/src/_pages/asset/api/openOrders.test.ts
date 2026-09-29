import { getAddressKey, OrderKind, OrderStatus } from '@cowprotocol/cow-sdk'

import { getOpenOrders } from './openOrders'

import { AAPLX_ARBITRUM, AAPLX_MAINNET, OWNER, USDC } from '../lib/fixtures'

import { orderBookApi, readTokensMetadata } from '@/shared/api'

jest.mock('@/shared/api', () => ({
  orderBookApi: { getOrders: jest.fn() },
  readTokensMetadata: jest.fn(),
}))

const getOrdersMock = orderBookApi.getOrders as jest.Mock
const readTokensMetadataMock = readTokensMetadata as jest.Mock

function order(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    uid: '0x01',
    status: OrderStatus.OPEN,
    kind: OrderKind.BUY,
    sellToken: USDC,
    sellAmount: '230000000',
    buyToken: AAPLX_MAINNET.address,
    buyAmount: '2000000000000000000',
    executedBuyAmount: '500000000000000000',
    executedSellAmountBeforeFees: '0',
    validTo: 1_790_000_000,
    creationDate: '2026-09-28T10:00:00.000Z',
    ...overrides,
  }
}

describe('getOpenOrders', () => {
  beforeEach(() => {
    readTokensMetadataMock.mockResolvedValue({
      [getAddressKey(USDC)]: { chainId: 1, address: USDC, symbol: 'USDC', decimals: 6 },
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('returns the open orders of the asset tokens, newest first', async () => {
    getOrdersMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1
        ? [
            order({ uid: '0x01' }),
            order({ uid: '0x02', status: OrderStatus.FULFILLED }),
            order({ uid: '0x03', buyToken: USDC, sellToken: '0x0000000000000000000000000000000000000001' }),
            order({ uid: '0x04', creationDate: '2026-09-28T11:00:00.000Z', status: OrderStatus.PRESIGNATURE_PENDING }),
          ]
        : [],
    )

    const orders = await getOpenOrders({ owner: OWNER, tokens: [AAPLX_MAINNET, AAPLX_ARBITRUM] })

    expect(getOrdersMock).toHaveBeenCalledWith({ owner: OWNER, limit: 100 }, { chainId: 1 })
    expect(getOrdersMock).toHaveBeenCalledWith({ owner: OWNER, limit: 100 }, { chainId: 42161 })
    expect(orders.map(({ uid }) => uid)).toEqual(['0x04', '0x01'])
    expect(orders[1]).toMatchObject({
      side: 'buy',
      assetToken: AAPLX_MAINNET,
      counterToken: { symbol: 'USDC', decimals: 6 },
      filledFraction: 0.25,
    })
  })

  it('measures the fill of sell orders by the sold amount', async () => {
    getOrdersMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1
        ? [
            order({
              kind: OrderKind.SELL,
              sellToken: AAPLX_MAINNET.address,
              sellAmount: '4',
              buyToken: USDC,
              executedSellAmountBeforeFees: '1',
            }),
          ]
        : [],
    )

    const [sellOrder] = await getOpenOrders({ owner: OWNER, tokens: [AAPLX_MAINNET] })

    expect(sellOrder).toMatchObject({ side: 'sell', filledFraction: 0.25 })
  })

  it('keeps the counter token unresolved when its metadata is unavailable', async () => {
    getOrdersMock.mockResolvedValue([order({})])
    readTokensMetadataMock.mockRejectedValue(new Error('RPC is down'))

    const [openOrder] = await getOpenOrders({ owner: OWNER, tokens: [AAPLX_MAINNET] })

    expect(openOrder.counterToken).toBe(null)
  })
})
