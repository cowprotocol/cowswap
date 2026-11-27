import { orderBookActivityProvider } from './orderBookActivityProvider'

import { AAPLX_ARBITRUM, AAPLX_MAINNET, OWNER, USDC } from '../../lib/fixtures'

import { orderBookApi, programmaticOrderApi, readTokensMetadata } from '@/shared/api'
import { getPublicClient } from '@/shared/lib/chain'

jest.mock('@/shared/api', () => ({
  orderBookApi: { getTrades: jest.fn(), getOrder: jest.fn() },
  programmaticOrderApi: { getDeployedCowSheds: jest.fn(), getTwapOrders: jest.fn() },
  readTokensMetadata: jest.fn(),
}))

jest.mock('@/shared/lib/chain', () => ({ getPublicClient: jest.fn() }))

const getTradesMock = orderBookApi.getTrades as jest.Mock
const getOrderMock = orderBookApi.getOrder as jest.Mock
const getDeployedCowShedsMock = programmaticOrderApi.getDeployedCowSheds as jest.Mock
const getTwapOrdersMock = programmaticOrderApi.getTwapOrders as jest.Mock
const getBlockMock = jest.fn()

const COW_SHED = '0x0000000000000000000000000000000000000c0e'
const TWAP_START = 1_790_000_000
const TWAP_INTERVAL = 3600

function twapPartOrder(validTo: number): Record<string, unknown> {
  return {
    class: 'limit',
    fullAppData: appData('twap'),
    owner: COW_SHED,
    sellToken: USDC,
    buyToken: AAPLX_MAINNET.address,
    sellAmount: '1500000',
    validTo,
  }
}

const TWAP = {
  owner: COW_SHED,
  schedule: {
    sellToken: USDC,
    buyToken: AAPLX_MAINNET.address,
    partSellAmount: 1_500_000n,
    effectiveStartTime: TWAP_START,
    timeBetweenParts: TWAP_INTERVAL,
    numberOfParts: 10,
  },
}

function appData(orderClass: string): string {
  return JSON.stringify({ metadata: { orderClass: { orderClass } } })
}

function trade(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    orderUid: '0x01',
    blockNumber: 100,
    logIndex: 0,
    owner: OWNER,
    sellToken: USDC,
    sellAmount: '230000000',
    buyToken: AAPLX_MAINNET.address,
    buyAmount: '1000000000000000000',
    txHash: '0xaa',
    ...overrides,
  }
}

describe('orderBookActivityProvider', () => {
  beforeEach(() => {
    ;(readTokensMetadata as jest.Mock).mockResolvedValue({})
    ;(getPublicClient as jest.Mock).mockReturnValue({ getBlock: getBlockMock })
    getOrderMock.mockResolvedValue({ class: 'limit', fullAppData: appData('market') })
    getDeployedCowShedsMock.mockResolvedValue({ items: [] })
    getTwapOrdersMock.mockResolvedValue({ items: [] })
    getBlockMock.mockImplementation(async ({ blockNumber }: { blockNumber: bigint }) => {
      if (blockNumber === 300n) throw new Error('RPC is down')

      return { timestamp: blockNumber * 10n }
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('returns the asset trades of all chains, newest first', async () => {
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1
        ? [
            trade({ blockNumber: 100 }),
            trade({ orderUid: '0x02', buyToken: '0x0000000000000000000000000000000000000001' }),
          ]
        : [
            trade({
              orderUid: '0x03',
              blockNumber: 200,
              sellToken: AAPLX_ARBITRUM.address,
              buyToken: USDC,
              txHash: null,
            }),
          ],
    )

    const activity = await orderBookActivityProvider.getActivity({
      owner: OWNER,
      tokens: [AAPLX_MAINNET, AAPLX_ARBITRUM],
      limit: 10,
    })

    expect(getTradesMock).toHaveBeenCalledWith({ owner: OWNER, offset: 0, limit: 1000 }, { chainId: 1 })
    expect(activity).toEqual([
      expect.objectContaining({ orderUid: '0x03', chainId: 42161, side: 'sell', timestamp: 2000, txHash: null }),
      expect.objectContaining({ orderUid: '0x01', chainId: 1, side: 'buy', timestamp: 1000, txHash: '0xaa' }),
    ])
  })

  it('leaves the time empty when the block is unavailable', async () => {
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1 ? [trade({ blockNumber: 300 })] : [],
    )

    const [item] = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(item.timestamp).toBe(null)
  })

  it('finds trades beyond the first page', async () => {
    const unrelated = trade({ buyToken: '0x0000000000000000000000000000000000000001' })

    getTradesMock.mockImplementation(async ({ offset }: { offset: number }, { chainId }: { chainId: number }) => {
      if (chainId !== 1) return []

      return offset === 0
        ? Array.from({ length: 1000 }, () => unrelated)
        : [trade({ orderUid: '0xold', blockNumber: 50 })]
    })

    const activity = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(activity.map(({ orderUid }) => orderUid)).toEqual(['0xold'])
  })

  it('reads each block timestamp once', async () => {
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1 ? [trade({ blockNumber: 400 })] : [],
    )

    await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })
    const [item] = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(item.timestamp).toBe(4000)
    expect(getBlockMock).toHaveBeenCalledTimes(1)
  })

  it('applies the limit', async () => {
    getTradesMock.mockResolvedValue([trade({ logIndex: 0 }), trade({ logIndex: 1 }), trade({ logIndex: 2 })])

    const activity = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 2 })

    expect(activity).toHaveLength(2)
  })

  it('takes the order type from the app data of the order', async () => {
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1
        ? [trade({ orderUid: '0xtwap', blockNumber: 500 }), trade({ orderUid: '0xswap', blockNumber: 501 })]
        : [],
    )
    getOrderMock.mockImplementation(async (orderUid: string) => ({
      class: 'limit',
      fullAppData: appData(orderUid === '0xtwap' ? 'twap' : 'market'),
    }))

    const activity = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(Object.fromEntries(activity.map(({ orderUid, orderType }) => [orderUid, orderType]))).toEqual({
      '0xtwap': 'twap',
      '0xswap': 'swap',
    })
    expect(getOrderMock).toHaveBeenCalledWith('0xtwap', { chainId: 1 })
  })

  it('reads the order types of the returned trades only', async () => {
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1
        ? [trade({ orderUid: '0xnewest', blockNumber: 900 }), trade({ orderUid: '0xoldest', blockNumber: 600 })]
        : [
            trade({
              orderUid: '0xnewer',
              blockNumber: 800,
              buyToken: AAPLX_ARBITRUM.address,
            }),
          ],
    )

    const activity = await orderBookActivityProvider.getActivity({
      owner: OWNER,
      tokens: [AAPLX_MAINNET, AAPLX_ARBITRUM],
      limit: 2,
    })

    expect(activity.map(({ orderUid }) => orderUid)).toEqual(['0xnewest', '0xnewer'])
    expect(getOrderMock.mock.calls).toEqual(
      expect.arrayContaining([
        ['0xnewest', { chainId: 1 }],
        ['0xnewer', { chainId: AAPLX_ARBITRUM.chainId }],
      ]),
    )
    expect(getOrderMock).toHaveBeenCalledTimes(2)
  })

  it('falls back to a swap when the order is unavailable', async () => {
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1 ? [trade({ orderUid: '0xmissing' })] : [],
    )
    getOrderMock.mockRejectedValue(new Error('Not found'))

    const [item] = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(item.orderType).toBe('swap')
  })

  it('includes the trades of the CoW Shed proxies of the owner', async () => {
    getDeployedCowShedsMock.mockResolvedValue({ items: [{ address: COW_SHED }] })
    getTradesMock.mockImplementation(async ({ owner }: { owner: string }, { chainId }: { chainId: number }) =>
      chainId === 1 && owner === COW_SHED ? [trade({ orderUid: '0xshed', owner: COW_SHED })] : [],
    )

    const activity = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(getDeployedCowShedsMock).toHaveBeenCalledWith({ owner: OWNER, chainId: 1 }, { limit: 1000 })
    expect(activity.map(({ orderUid }) => orderUid)).toEqual(['0xshed'])
  })

  it('keeps the trades of the owner when its CoW Sheds are unavailable', async () => {
    getDeployedCowShedsMock.mockRejectedValue(new Error('Indexer is down'))
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1 ? [trade({ orderUid: '0xowner' })] : [],
    )

    const activity = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(activity.map(({ orderUid }) => orderUid)).toEqual(['0xowner'])
  })

  it('numbers the parts of a TWAP', async () => {
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1 ? [trade({ orderUid: '0xpart2', owner: COW_SHED })] : [],
    )
    getOrderMock.mockResolvedValue(twapPartOrder(TWAP_START + 2 * TWAP_INTERVAL - 1))
    getTwapOrdersMock.mockResolvedValue({ items: [TWAP] })

    const [item] = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(item).toEqual(expect.objectContaining({ orderType: 'twap', twapPart: { number: 2, count: 10 } }))
    expect(getTwapOrdersMock).toHaveBeenCalledWith(
      { resolvedOwner: OWNER, chainId: 1 },
      { direction: 'desc', offset: 0, limit: 1000 },
    )
  })

  it('leaves a TWAP part unnumbered while its TWAP is unavailable, and numbers it later', async () => {
    getTradesMock.mockImplementation(async (_request: unknown, { chainId }: { chainId: number }) =>
      chainId === 1 ? [trade({ orderUid: '0xpart3', owner: COW_SHED })] : [],
    )
    getOrderMock.mockResolvedValue(twapPartOrder(TWAP_START + 3 * TWAP_INTERVAL - 1))
    getTwapOrdersMock.mockRejectedValueOnce(new Error('Indexer is down'))

    const [before] = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(before).toEqual(expect.objectContaining({ orderType: 'twap', twapPart: null }))

    getTwapOrdersMock.mockResolvedValue({ items: [TWAP] })

    const [after] = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 10 })

    expect(after.twapPart).toEqual({ number: 3, count: 10 })
  })
})
