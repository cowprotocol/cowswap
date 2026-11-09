import { getAddressKey, OrderKind, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import { getOpenOrders } from './openOrders'

import { AAPLX_ARBITRUM, AAPLX_MAINNET, OWNER, USDC } from '../lib/fixtures'

import { orderBookApi, programmaticOrderApi, readTokensMetadata } from '@/shared/api'

jest.mock('@/shared/api', () => ({
  orderBookApi: { getOrders: jest.fn() },
  programmaticOrderApi: { getTwapOrders: jest.fn() },
  readTokensMetadata: jest.fn(),
}))

const getOrdersMock = orderBookApi.getOrders as jest.Mock
const getTwapOrdersMock = programmaticOrderApi.getTwapOrders as jest.Mock
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
    signingScheme: SigningScheme.EIP712,
    ...overrides,
  }
}

function twap(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    eventId: 'event-1',
    hash: TWAP_HASH,
    owner: OWNER,
    resolvedOwner: OWNER,
    status: 'open',
    createdAt: 1_791_000_000,
    schedule: TWAP_SCHEDULE,
    executedAmounts: { executedSellAmount: 1_500_000n },
    ...overrides,
  }
}

const TWAP_HASH = `0x${'aa'.repeat(32)}`
const COW_SHED = '0x0000000000000000000000000000000000000c0e'

const TWAP_SCHEDULE = {
  sellToken: USDC,
  buyToken: AAPLX_MAINNET.address,
  partSellAmount: 1_500_000n,
  minPartLimit: 9_000_000_000_000_000n,
  numberOfParts: 2,
  effectiveStartTime: 1_790_000_000,
  timeBetweenParts: 600,
}

function twapPage(
  chainId: number,
  items: Record<string, unknown>[],
): (params: { chainId: number }) => Promise<unknown> {
  return async (params) => ({ items: params.chainId === chainId ? items : [], totalCount: items.length })
}

describe('getOpenOrders', () => {
  beforeEach(() => {
    getTwapOrdersMock.mockResolvedValue({ items: [], totalCount: 0 })
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

    expect(getOrdersMock).toHaveBeenCalledWith({ owner: OWNER, offset: 0, limit: 1000 }, { chainId: 1 })
    expect(getOrdersMock).toHaveBeenCalledWith({ owner: OWNER, offset: 0, limit: 1000 }, { chainId: 42161 })
    expect(orders.map(({ uid }) => uid)).toEqual(['0x04', '0x01'])
    expect(orders[1]).toMatchObject({
      side: 'buy',
      assetToken: AAPLX_MAINNET,
      counterToken: { symbol: 'USDC', decimals: 6 },
      filledFraction: 0.25,
    })
  })

  it('finds open orders beyond the first page', async () => {
    const unrelated = order({ buyToken: '0x0000000000000000000000000000000000000001' })

    getOrdersMock.mockImplementation(async ({ offset }: { offset: number }, { chainId }: { chainId: number }) => {
      if (chainId !== 1) return []

      return offset === 0 ? Array.from({ length: 1000 }, () => unrelated) : [order({ uid: '0xold' })]
    })

    const orders = await getOpenOrders({ owner: OWNER, tokens: [AAPLX_MAINNET] })

    expect(getOrdersMock).toHaveBeenCalledWith({ owner: OWNER, offset: 1000, limit: 1000 }, { chainId: 1 })
    expect(orders.map(({ uid }) => uid)).toEqual(['0xold'])
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

  it('allows soft cancellation only for orders signed off-chain by their owner', async () => {
    getOrdersMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1
        ? [
            order({ uid: '0x01' }),
            order({ uid: '0x02', signingScheme: SigningScheme.ETHSIGN }),
            order({ uid: '0x03', signingScheme: SigningScheme.PRESIGN }),
            order({ uid: '0x04', signingScheme: SigningScheme.EIP1271 }),
            order({ uid: '0x05', onchainOrderData: { sender: OWNER } }),
          ]
        : [],
    )

    const orders = await getOpenOrders({ owner: OWNER, tokens: [AAPLX_MAINNET] })

    expect(Object.fromEntries(orders.map(({ uid, isSoftCancellable }) => [uid, isSoftCancellable]))).toEqual({
      '0x01': true,
      '0x02': true,
      '0x03': false,
      '0x04': false,
      '0x05': false,
    })
  })

  it('shows open TWAPs as one order with the part amounts instead of their parts', async () => {
    getOrdersMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1
        ? [
            order({ uid: '0x01' }),
            order({ uid: '0x02', fullAppData: JSON.stringify({ metadata: { orderClass: { orderClass: 'twap' } } }) }),
          ]
        : [],
    )
    getTwapOrdersMock.mockImplementation(
      twapPage(1, [
        twap({ eventId: 'open' }),
        twap({ eventId: 'filled', status: 'filled' }),
        twap({ eventId: 'unrelated', schedule: { ...TWAP_SCHEDULE, buyToken: USDC } }),
      ]),
    )

    const orders = await getOpenOrders({ owner: OWNER, tokens: [AAPLX_MAINNET] })

    expect(getTwapOrdersMock).toHaveBeenCalledWith(
      { resolvedOwner: OWNER, chainId: 1 },
      { direction: 'desc', offset: 0, limit: 1000 },
    )
    expect(orders.map(({ uid }) => uid)).toEqual(['open', '0x01'])
    expect(orders[0]).toMatchObject({
      type: 'twap',
      side: 'buy',
      assetAmount: '9000000000000000',
      counterAmount: '1500000',
      counterToken: { symbol: 'USDC' },
      filledFraction: 0.5,
      validTo: 1_790_001_200,
      twapSchedule: { startTime: 1_790_000_000, interval: 600, partsCount: 2 },
      isSoftCancellable: false,
    })
  })

  it('keeps the TWAP parts when the TWAPs fail to load', async () => {
    getOrdersMock.mockResolvedValue([
      order({ uid: '0x02', fullAppData: JSON.stringify({ metadata: { orderClass: { orderClass: 'twap' } } }) }),
    ])
    getTwapOrdersMock.mockRejectedValue(new Error('Indexer is down'))

    const orders = await getOpenOrders({ owner: OWNER, tokens: [AAPLX_MAINNET] })

    expect(orders.map(({ uid }) => uid)).toEqual(['0x02'])
  })

  it('cancels through the CoW Shed only the TWAPs placed by an EOA', async () => {
    getOrdersMock.mockResolvedValue([])
    getTwapOrdersMock.mockImplementation(
      twapPage(1, [twap({ eventId: 'safe', createdAt: 1_791_000_001 }), twap({ eventId: 'eoa', owner: COW_SHED })]),
    )

    const orders = await getOpenOrders({ owner: OWNER, tokens: [AAPLX_MAINNET] })

    expect(orders.map(({ uid, cowShedTwap }) => [uid, cowShedTwap])).toEqual([
      ['safe', undefined],
      ['eoa', { eventId: 'eoa', hash: TWAP_HASH, cowShedAddress: COW_SHED }],
    ])
  })
})
