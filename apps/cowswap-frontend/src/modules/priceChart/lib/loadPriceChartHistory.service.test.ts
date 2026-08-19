import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { loadPriceChartHistory } from './loadPriceChartHistory.service'

import { fetchPriceChartData, fetchTokenSupply } from '../api'

import type { PriceChartSymbolDescriptor } from './tradingView.types'

jest.mock('../api', () => ({
  fetchPriceChartData: jest.fn(),
  fetchTokenSupply: jest.fn(),
}))

const SYMBOL = {
  baseAsset: {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: SupportedChainId.MAINNET,
    symbol: 'USDC',
  },
} as PriceChartSymbolDescriptor

describe('loadPriceChartHistory', () => {
  it('preserves USD volume when prices are converted to market cap', async () => {
    jest
      .mocked(fetchPriceChartData)
      .mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000, volume: 123.45 }])
    jest.mocked(fetchTokenSupply).mockResolvedValue({ circulatingSupply: 10, totalSupply: null })

    await expect(loadPriceChartHistory(SYMBOL, 1, 2, '60', 'marketCap')).resolves.toEqual([
      { close: 20, high: 30, low: 10, open: 15, timestamp: 1710000000, volume: 123.45 },
    ])
  })
})
