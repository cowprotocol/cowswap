/**
 * @jest-environment node
 */
import { loadSharesPerToken, loadTradingPause } from './sharesMultipliers'

import { getTokenKey } from '../lib/tokenKey'

import type { RwaAsset, RwaToken } from '../model/types'

import { fetchOndoSharesMultipliers, fetchXStocksActivation, readVaultAssetsPerShare } from '@/shared/api/index.server'

jest.mock('next/cache', () => ({
  unstable_cache: <T extends unknown[], R>(load: (...args: T) => Promise<R>) => load,
}))

jest.mock('@/shared/api/index.server', () => ({
  fetchOndoSharesMultipliers: jest.fn(),
  fetchXStocksActivation: jest.fn(),
  readVaultAssetsPerShare: jest.fn(),
  withRetryBackoff: <T>(_key: string, load: () => Promise<T>) => load(),
}))

jest.mock('../model/registry', () => ({
  getAssets: () => [{ tokens: mockRegistryTokens }],
}))

function token(symbol: string, chainId: number, address: string, issuer: string, coingeckoId?: string): RwaToken {
  return { chainId, address, symbol, name: symbol, decimals: 18, issuer, coingeckoId }
}

const NVDAON = token('NVDAon', 1, '0x0000000000000000000000000000000000000001', 'Ondo')
const NFLXON = token('NFLXON', 56, '0x0000000000000000000000000000000000000002', 'Ondo')
const NVDAX = token('NVDAX', 57073, '0x0000000000000000000000000000000000000003', 'xStocks', 'nvidia-xstock')
const WNVDAX = token('WNVDAX', 1, '0x0000000000000000000000000000000000000004', 'xStocks', 'wrapped-nvidia-xstock')
const WNVDAX_ARBITRUM = { ...WNVDAX, chainId: 42161 }
const WSPYX = token('WSPYX', 42161, '0x0000000000000000000000000000000000000005', 'xStocks', 'wrapped-sp500-xstock')

const mockRegistryTokens = [NVDAON, NFLXON, NVDAX, WNVDAX, WNVDAX_ARBITRUM, WSPYX]

const fetchOndoMock = fetchOndoSharesMultipliers as jest.Mock
const fetchActivationMock = fetchXStocksActivation as jest.Mock
const readVaultRatesMock = readVaultAssetsPerShare as jest.Mock

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  fetchOndoMock.mockResolvedValue({ NVDAON: 1.0017, NFLXON: 10 })
  readVaultRatesMock.mockImplementation(async (chainId: number) =>
    chainId === 1 ? { [WNVDAX.address]: 0.9917 } : { [WNVDAX.address]: 1, [WSPYX.address]: 1.0057 },
  )
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('loadSharesPerToken', () => {
  it('takes Ondo multipliers by symbol, wrapped xStocks rates by network, and one share per rebasing token', async () => {
    const result = await loadSharesPerToken([NVDAON, NFLXON, NVDAX, WNVDAX, WNVDAX_ARBITRUM])

    expect(result).toEqual({
      byKey: {
        [getTokenKey(NVDAON)]: 1.0017,
        [getTokenKey(NFLXON)]: 10,
        [getTokenKey(NVDAX)]: 1,
        [getTokenKey(WNVDAX)]: 0.9917,
        [getTokenKey(WNVDAX_ARBITRUM)]: 1,
      },
      degraded: false,
    })
  })

  it('reads every registry wrapper of a network, so routes share one rate request per network', async () => {
    await loadSharesPerToken([WNVDAX_ARBITRUM])

    expect(readVaultRatesMock).toHaveBeenCalledTimes(1)
    expect(readVaultRatesMock).toHaveBeenCalledWith(42161, [WNVDAX_ARBITRUM, WSPYX])
  })

  it('requests nothing for tokens that need no upstream data', async () => {
    expect(await loadSharesPerToken([NVDAX])).toEqual({ byKey: { [getTokenKey(NVDAX)]: 1 }, degraded: false })
    expect(fetchOndoMock).not.toHaveBeenCalled()
    expect(readVaultRatesMock).not.toHaveBeenCalled()
  })

  it('takes one share per rebasing or cash-payout token and leaves Coinbase tokens out', async () => {
    const nvdab = token('NVDAB', 56, '0x0000000000000000000000000000000000000006', 'bStocks')
    const rnvda = token('RNVDA', 42161, '0x0000000000000000000000000000000000000007', 'Reality')
    const nvdac = token('NVDAC', 8453, '0x0000000000000000000000000000000000000008', 'Coinbase')

    expect(await loadSharesPerToken([nvdab, rnvda, nvdac])).toEqual({
      byKey: { [getTokenKey(nvdab)]: 1, [getTokenKey(rnvda)]: 1 },
      degraded: false,
    })
  })

  it('leaves Ondo tokens out without degrading when no API key is set', async () => {
    fetchOndoMock.mockResolvedValue(null)

    expect(await loadSharesPerToken([NVDAON])).toEqual({ byKey: {}, degraded: false })
  })

  it('leaves out the tokens of a failed source and degrades', async () => {
    fetchOndoMock.mockRejectedValue(new Error('Ondo responded with 500'))
    readVaultRatesMock.mockRejectedValue(new Error('RPC timeout'))

    expect(await loadSharesPerToken([NVDAON, NVDAX, WNVDAX])).toEqual({
      byKey: { [getTokenKey(NVDAX)]: 1 },
      degraded: true,
    })
  })
})

describe('loadTradingPause', () => {
  const asset = { ticker: 'NVDA', tokens: [NVDAON, WNVDAX, NVDAX] } as RwaAsset
  const activatesAt = Date.parse('2026-10-28T00:30:00.000Z')

  it('pauses rebasing xStocks tokens 15 minutes around the pending multiplier activation', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-27T12:00:00.000Z'))
    fetchActivationMock.mockResolvedValue(activatesAt)

    expect(await loadTradingPause(asset)).toEqual({
      issuer: 'xStocks',
      start: '2026-10-28T00:15:00.000Z',
      end: '2026-10-28T00:45:00.000Z',
    })
    expect(fetchActivationMock).toHaveBeenCalledWith('NVDAx', 57073)
  })

  it('keeps the pause after the multiplier activated', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-28T00:40:00.000Z'))
    fetchActivationMock.mockResolvedValue(activatesAt)

    expect(await loadTradingPause(asset)).toEqual({
      issuer: 'xStocks',
      start: '2026-10-28T00:15:00.000Z',
      end: '2026-10-28T00:45:00.000Z',
    })
  })

  it('is null once the pause is over', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-28T00:45:00.000Z'))
    fetchActivationMock.mockResolvedValue(activatesAt)

    expect(await loadTradingPause(asset)).toBeNull()
  })

  it('is null without a known activation, a rebasing xStocks token, or when the request fails', async () => {
    fetchActivationMock.mockResolvedValue(null)
    expect(await loadTradingPause(asset)).toBeNull()

    expect(await loadTradingPause({ ...asset, tokens: [NVDAON, WNVDAX] })).toBeNull()

    fetchActivationMock.mockRejectedValue(new Error('xStocks responded with 500'))
    expect(await loadTradingPause(asset)).toBeNull()
  })
})
