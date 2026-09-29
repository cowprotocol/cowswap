import { orderBookActivityProvider } from './orderBookActivityProvider'

import { AAPLX_ARBITRUM, AAPLX_MAINNET, OWNER, USDC } from '../../lib/fixtures'

import { orderBookApi, readTokensMetadata } from '@/shared/api'
import { getPublicClient } from '@/shared/lib/chain'

jest.mock('@/shared/api', () => ({
  orderBookApi: { getTrades: jest.fn() },
  readTokensMetadata: jest.fn(),
}))

jest.mock('@/shared/lib/chain', () => ({ getPublicClient: jest.fn() }))

const getTradesMock = orderBookApi.getTrades as jest.Mock
const getBlockMock = jest.fn()

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

    expect(getTradesMock).toHaveBeenCalledWith({ owner: OWNER, limit: 100 }, { chainId: 1 })
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

  it('applies the limit', async () => {
    getTradesMock.mockResolvedValue([trade({ logIndex: 0 }), trade({ logIndex: 1 }), trade({ logIndex: 2 })])

    const activity = await orderBookActivityProvider.getActivity({ owner: OWNER, tokens: [AAPLX_MAINNET], limit: 2 })

    expect(activity).toHaveLength(2)
  })
})
