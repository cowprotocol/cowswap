import { USDC_MAINNET } from '@cowprotocol/common-const'

import { loadMarketCapSupply, loadPriceChartHistory } from './loadPriceChartHistory'

import { fetchPriceHistory } from '../api/fetchPriceHistory'
import { fetchTokenSupply } from '../api/fetchTokenSupply'

jest.mock('../api/fetchPriceHistory', () => ({ fetchPriceHistory: jest.fn() }))
jest.mock('../api/fetchTokenSupply', () => ({ fetchTokenSupply: jest.fn() }))

const CURRENCY = USDC_MAINNET

describe('loadPriceChartHistory', () => {
  it('preserves USD volume when prices are converted to market cap', async () => {
    jest
      .mocked(fetchPriceHistory)
      .mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000, volume: 123.45 }])
    jest.mocked(fetchTokenSupply).mockResolvedValue({ circulatingSupply: 10, totalSupply: null })

    await expect(loadPriceChartHistory(CURRENCY, 1, 2, '1h', 'marketCap', 'circulating')).resolves.toEqual([
      { close: 20, high: 30, low: 10, open: 15, timestamp: 1710000000, volume: 123.45 },
    ])
  })

  it.each([null, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid circulating supply: %s',
    async (circulatingSupply) => {
      jest.mocked(fetchTokenSupply).mockResolvedValue({ circulatingSupply, totalSupply: 100 })

      await expect(loadMarketCapSupply(CURRENCY, 'circulating')).rejects.toThrow('Token supplies unavailable')
    },
  )

  it('scales market cap with total supply when selected', async () => {
    jest.mocked(fetchPriceHistory).mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1 }])
    jest.mocked(fetchTokenSupply).mockResolvedValue({ circulatingSupply: 10, totalSupply: 20 })

    await expect(loadPriceChartHistory(CURRENCY, 1, 2, '1h', 'marketCap', 'total')).resolves.toEqual([
      { close: 40, high: 60, low: 20, open: 30, timestamp: 1 },
    ])
  })
})
