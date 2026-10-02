/**
 * @jest-environment node
 */
import { coingeckoProvider, toChartPoints } from './marketData'

import type { RwaAsset } from '../model/types'

const NVDA: RwaAsset = {
  ticker: 'NVDA',
  title: 'NVIDIA',
  type: 'stock',
  priority: 9,
  tokens: [
    {
      chainId: 1,
      address: '0x2D1F7226Bd1F780AF6B9A49DCC0aE00E8Df4bDEE',
      symbol: 'NVDAon',
      name: 'NVIDIA (Ondo Tokenized)',
      decimals: 18,
      issuer: 'Ondo',
      coingeckoId: 'nvidia-ondo-tokenized-stock',
    },
    {
      chainId: 56,
      address: '0xA9ee28c80F960B889DFbd1902055218cba016F75',
      symbol: 'NVDAon',
      name: 'NVIDIA (Ondo Tokenized)',
      decimals: 18,
      issuer: 'Ondo',
      coingeckoId: 'nvidia-ondo-tokenized-stock',
    },
    {
      chainId: 1,
      address: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d',
      symbol: 'NVDAx',
      name: 'NVIDIA xStock',
      decimals: 18,
      issuer: 'xStocks',
      coingeckoId: 'nvidia-xstock',
    },
  ],
}

const NO_DATA: RwaAsset = { ...NVDA, ticker: 'NONE', tokens: [{ ...NVDA.tokens[0], coingeckoId: undefined }] }

function mockFetch(body: unknown, ok = true): jest.Mock {
  const fetchMock = jest.fn().mockResolvedValue({ ok, status: ok ? 200 : 429, json: () => Promise.resolve(body) })
  global.fetch = fetchMock

  return fetchMock
}

describe('coingeckoProvider.getMarketData', () => {
  it('takes price from the first token and sums market caps and volumes of unique tokens', async () => {
    const fetchMock = mockFetch([
      {
        id: 'nvidia-xstock',
        current_price: 231.8,
        market_cap: 43,
        total_volume: 5,
        image: 'https://coin-images.coingecko.com/nvidia-xstock.png',
        high_24h: 232,
        low_24h: 223,
        price_change_percentage_24h: 2.6,
        last_updated: '2026-09-28T13:00:00.000Z',
      },
      {
        id: 'nvidia-ondo-tokenized-stock',
        current_price: 231.5,
        market_cap: 39,
        total_volume: 7,
        image: null,
        high_24h: 230,
        low_24h: 223.2,
        price_change_percentage_24h: 2.5,
        last_updated: '2026-09-28T13:01:00.000Z',
      },
    ])

    const result = await coingeckoProvider.getMarketData([NVDA, NO_DATA])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain('ids=nvidia-ondo-tokenized-stock,nvidia-xstock')
    expect(result.get('NVDA')).toEqual({
      price: 231.5,
      change24h: 2.5,
      dayLow: 223.2,
      dayHigh: 230,
      marketCap: 82,
      volume24h: 12,
      updatedAt: '2026-09-28T13:01:00.000Z',
      tokens: {
        'nvidia-xstock': {
          price: 231.8,
          marketCap: 43,
          volume24h: 5,
          logoUrl: 'https://coin-images.coingecko.com/nvidia-xstock.png',
        },
        'nvidia-ondo-tokenized-stock': { price: 231.5, marketCap: 39, volume24h: 7, logoUrl: null },
      },
    })
    expect(result.has('NONE')).toBe(false)
  })

  it('does not take price from another token when the first one has no data', async () => {
    mockFetch([
      {
        id: 'nvidia-xstock',
        current_price: 231.8,
        market_cap: 43,
        total_volume: 5,
        image: 'https://coin-images.coingecko.com/nvidia-xstock.png',
        high_24h: 232,
        low_24h: 223,
        price_change_percentage_24h: 2.6,
        last_updated: '2026-09-28T13:00:00.000Z',
      },
    ])

    const result = await coingeckoProvider.getMarketData([NVDA])

    expect(result.get('NVDA')).toEqual({
      price: null,
      change24h: null,
      dayLow: null,
      dayHigh: null,
      marketCap: 43,
      volume24h: 5,
      updatedAt: null,
      tokens: {
        'nvidia-xstock': {
          price: 231.8,
          marketCap: 43,
          volume24h: 5,
          logoUrl: 'https://coin-images.coingecko.com/nvidia-xstock.png',
        },
      },
    })
  })

  it('throws when the upstream fails', async () => {
    mockFetch({}, false)

    await expect(coingeckoProvider.getMarketData([NVDA])).rejects.toThrow('responded with 429')
  })
})

describe('toChartPoints', () => {
  it('converts ms timestamps to seconds and keeps time strictly ascending', () => {
    expect(
      toChartPoints([
        [1_000, 1],
        [2_000, 2],
        [2_500, 3],
        [3_000, 4],
      ]),
    ).toEqual([
      { time: 1, value: 1 },
      { time: 2, value: 3 },
      { time: 3, value: 4 },
    ])
  })
})
