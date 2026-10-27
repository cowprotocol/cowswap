import { getPositionValue } from './positionValue'

import { getTokenKey, type RwaMarketData, type RwaToken } from '@/entities/asset'

const NVDAON: RwaToken = {
  chainId: 1,
  address: '0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee',
  symbol: 'NVDAon',
  name: 'NVIDIA (Ondo Tokenized)',
  decimals: 18,
  issuer: 'Ondo',
  coingeckoId: 'nvidia-ondo-tokenized-stock',
}

const MARKET: RwaMarketData = {
  price: 180,
  change24h: null,
  dayLow: null,
  dayHigh: null,
  marketCap: null,
  volume24h: null,
  updatedAt: null,
  tokens: { 'nvidia-ondo-tokenized-stock': { price: 190, marketCap: null, volume24h: null, logoUrl: null } },
  sharesPerToken: {},
}

const TWO = '2000000000000000000'

describe('getPositionValue', () => {
  it('values the balance at the token price', () => {
    expect(getPositionValue(NVDAON, TWO, MARKET)).toBe(380)
  })

  it('falls back to the stock price without a token price', () => {
    expect(getPositionValue({ ...NVDAON, coingeckoId: undefined }, TWO, MARKET)).toBe(360)
    expect(getPositionValue(NVDAON, TWO, { ...MARKET, tokens: {} })).toBe(360)
  })

  it('falls back to the stock price of the shares a token stands for', () => {
    expect(
      getPositionValue(NVDAON, TWO, { ...MARKET, tokens: {}, sharesPerToken: { [getTokenKey(NVDAON)]: 1.5 } }),
    ).toBe(540)
  })

  it('is null without any price', () => {
    expect(getPositionValue(NVDAON, TWO, { ...MARKET, price: null, tokens: {} })).toBeNull()
    expect(getPositionValue(NVDAON, TWO, undefined)).toBeNull()
  })
})
