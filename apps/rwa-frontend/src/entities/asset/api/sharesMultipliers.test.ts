/**
 * @jest-environment node
 */
import { loadSharesPerToken, loadTradingPause } from './sharesMultipliers'

import { getTokenKey } from '../lib/tokenKey'

import type { RwaAsset, RwaToken } from '../model/types'

import {
  fetchOndoSharesMultipliers,
  fetchXStocksActivation,
  readUiMultipliers,
  readVaultAssetsPerShare,
} from '@/shared/api/index.server'

jest.mock('next/cache', () => ({
  unstable_cache: <T extends unknown[], R>(load: (...args: T) => Promise<R>) => load,
}))

jest.mock('@/shared/api/index.server', () => ({
  fetchOndoSharesMultipliers: jest.fn(),
  fetchXStocksActivation: jest.fn(),
  readUiMultipliers: jest.fn(),
  readVaultAssetsPerShare: jest.fn(),
  withRetryBackoff: <T>(_key: string, load: () => Promise<T>) => load(),
}))

jest.mock('../model/registry', () => ({
  getAllAssets: () => [{ tokens: mockRegistryTokens }],
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
const WTNKE = token('WTNKE', 8453, '0x000000000000000000000000000000000000000c', 'ST0x', 'nike-st0x-tokenized-stock')
const NVDA_ROBINHOOD = token('NVDA', 4663, '0x000000000000000000000000000000000000000d', 'Robinhood')

const PAXG = token('PAXG', 1, '0x0000000000000000000000000000000000000009', 'Paxos', 'pax-gold')
const XAUT = token('XAUT', 1, '0x000000000000000000000000000000000000000a', 'Tether', 'tether-gold')
const KAU = token('KAU', 1, '0x0000000000000000000000000000000000000010', 'Kinesis Money', 'kinesis-gold')
const KAG = token('KAG', 1, '0x0000000000000000000000000000000000000011', 'Kinesis Money', 'kinesis-silver')
const GGBR = token('GGBR', 1, '0x0000000000000000000000000000000000000013', 'Goldfish', 'goldfish-gold')

const mockRegistryTokens = [NVDAON, NFLXON, NVDAX, WNVDAX, WNVDAX_ARBITRUM, WSPYX, WTNKE, NVDA_ROBINHOOD]

const fetchOndoMock = fetchOndoSharesMultipliers as jest.Mock
const fetchActivationMock = fetchXStocksActivation as jest.Mock
const readVaultRatesMock = readVaultAssetsPerShare as jest.Mock
const readUiMultipliersMock = readUiMultipliers as jest.Mock

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  fetchOndoMock.mockResolvedValue({ NVDAON: 1.0017, NFLXON: 10 })
  readVaultRatesMock.mockImplementation(async (chainId: number) =>
    chainId === 1
      ? { [WNVDAX.address]: 0.9917 }
      : chainId === 8453
        ? { [WTNKE.address]: 1.004 }
        : { [WNVDAX.address]: 1, [WSPYX.address]: 1.0057 },
  )
  readUiMultipliersMock.mockResolvedValue({ [NVDA_ROBINHOOD.address]: 1.0008 })
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

  it('reads ST0x tokens as vaults and Robinhood tokens by their UI multiplier', async () => {
    expect(await loadSharesPerToken([WTNKE, NVDA_ROBINHOOD])).toEqual({
      byKey: { [getTokenKey(WTNKE)]: 1.004, [getTokenKey(NVDA_ROBINHOOD)]: 1.0008 },
      degraded: false,
    })
    expect(readVaultRatesMock).toHaveBeenCalledWith(8453, [WTNKE])
    expect(readUiMultipliersMock).toHaveBeenCalledWith(4663, [NVDA_ROBINHOOD])
  })

  it('degrades when a vault or UI-multiplier token gets no onchain rate', async () => {
    readVaultRatesMock.mockResolvedValue({})
    readUiMultipliersMock.mockResolvedValue({})

    expect(await loadSharesPerToken([WTNKE, NVDA_ROBINHOOD])).toEqual({ byKey: {}, degraded: true })
  })

  it('requests nothing for tokens that need no upstream data', async () => {
    expect(await loadSharesPerToken([NVDAX])).toEqual({ byKey: { [getTokenKey(NVDAX)]: 1 }, degraded: false })
    expect(fetchOndoMock).not.toHaveBeenCalled()
    expect(readVaultRatesMock).not.toHaveBeenCalled()
    expect(readUiMultipliersMock).not.toHaveBeenCalled()
  })

  it('takes one share per rebasing or cash-payout token and leaves Coinbase tokens out', async () => {
    const nvdab = token('NVDAB', 56, '0x0000000000000000000000000000000000000006', 'bStocks')
    const rnvda = token('RNVDA', 42161, '0x0000000000000000000000000000000000000007', 'Reality')
    const nvdac = token('NVDAC', 8453, '0x0000000000000000000000000000000000000008', 'Coinbase')
    const dinari = token('NVDA', 1, '0x000000000000000000000000000000000000000e', 'Dinari')
    const anchored = token('ANVDA', 1, '0x000000000000000000000000000000000000000f', 'Anchored')

    expect(await loadSharesPerToken([nvdab, rnvda, nvdac, dinari, anchored])).toEqual({
      byKey: { [getTokenKey(nvdab)]: 1, [getTokenKey(rnvda)]: 1, [getTokenKey(dinari)]: 1, [getTokenKey(anchored)]: 1 },
      degraded: false,
    })
  })

  it('takes the troy ounces a commodity token holds, per token rather than per issuer', async () => {
    const result = await loadSharesPerToken([PAXG, XAUT, KAU, KAG, GGBR])

    expect(result.byKey).toEqual({
      [getTokenKey(PAXG)]: 1,
      [getTokenKey(XAUT)]: 1,
      [getTokenKey(KAU)]: expect.closeTo(1 / 31.1034768, 10),
      [getTokenKey(KAG)]: 1,
      [getTokenKey(GGBR)]: 0.001,
    })
  })

  it('leaves a commodity token of unknown size out', async () => {
    const unknown = token('GLDX', 1, '0x0000000000000000000000000000000000000012', 'Unknown Gold', 'unknown-gold')

    expect(await loadSharesPerToken([unknown])).toEqual({ byKey: {}, degraded: false })
  })

  it('leaves a stock token of an issuer with an unknown dividend model out', async () => {
    const nvdas = token('NVDAS', 56, '0x000000000000000000000000000000000000000b', 'Stove Finance')

    expect(await loadSharesPerToken([nvdas])).toEqual({ byKey: {}, degraded: false })
  })

  it('leaves Ondo tokens out without degrading when no API key is set', async () => {
    fetchOndoMock.mockResolvedValue(null)

    expect(await loadSharesPerToken([NVDAON])).toEqual({ byKey: {}, degraded: false })
  })

  it('leaves out the tokens of a failed source and degrades', async () => {
    fetchOndoMock.mockRejectedValue(new Error('Ondo responded with 500'))
    readVaultRatesMock.mockRejectedValue(new Error('RPC timeout'))
    readUiMultipliersMock.mockRejectedValue(new Error('RPC timeout'))

    expect(await loadSharesPerToken([NVDAON, NVDAX, WNVDAX, NVDA_ROBINHOOD])).toEqual({
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
