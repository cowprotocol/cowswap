import { getTokenPriceSharesPerToken } from './tokenPriceShares'

import { getTokenKey, type RwaToken } from '@/entities/asset'

const NFLXON: RwaToken = {
  chainId: 1,
  address: '0x0000000000000000000000000000000000000001',
  symbol: 'NFLXon',
  name: 'Netflix (Ondo Tokenized)',
  decimals: 18,
  issuer: 'Ondo',
  coingeckoId: 'netflix-ondo-tokenized-stock',
}

const WNVDAX: RwaToken = {
  chainId: 1,
  address: '0x0000000000000000000000000000000000000002',
  symbol: 'WNVDAX',
  name: 'Wrapped NVIDIA xStock',
  decimals: 18,
  issuer: 'xStocks',
  coingeckoId: 'wrapped-nvidia-xstock',
}

describe('getTokenPriceSharesPerToken', () => {
  it('keeps the multiplier every token of a CoinGecko id shares', () => {
    const bnb = { ...NFLXON, chainId: 56 }
    const sharesPerToken = { [getTokenKey(NFLXON)]: 10, [getTokenKey(bnb)]: 10 }

    expect(getTokenPriceSharesPerToken([NFLXON, bnb], sharesPerToken)).toEqual(sharesPerToken)
  })

  it('leaves out tokens of a CoinGecko id whose multipliers differ per network', () => {
    const arbitrum = { ...WNVDAX, chainId: 42161 }
    const sharesPerToken = { [getTokenKey(WNVDAX)]: 0.9918, [getTokenKey(arbitrum)]: 1 }

    expect(getTokenPriceSharesPerToken([WNVDAX, arbitrum], sharesPerToken)).toEqual({})
  })

  it('leaves out tokens of a CoinGecko id when another one has no multiplier', () => {
    const arbitrum = { ...WNVDAX, chainId: 42161 }

    expect(getTokenPriceSharesPerToken([WNVDAX, arbitrum], { [getTokenKey(WNVDAX)]: 0.9918 })).toEqual({})
  })
})
