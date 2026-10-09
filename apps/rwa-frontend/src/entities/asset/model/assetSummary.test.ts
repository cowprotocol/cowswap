/**
 * @jest-environment node
 */
import { toAssetSummaries } from './assetSummary'
import { getAssets, getAssetSummaries } from './registry'

import type { RwaAsset } from './types'

const NVDA: RwaAsset = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  logoUrl: 'https://example.com/nvda.png',
  type: 'stock',
  priority: 9,
  allowedTradingTime: { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' },
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
  ],
}

describe('toAssetSummaries', () => {
  it('keeps only the fields a client page needs', () => {
    expect(toAssetSummaries([NVDA])).toStrictEqual([
      {
        ticker: 'NVDA',
        title: 'NVIDIA',
        logoUrl: 'https://example.com/nvda.png',
        type: 'stock',
        tokens: [
          {
            chainId: 1,
            address: '0x2D1F7226Bd1F780AF6B9A49DCC0aE00E8Df4bDEE',
            symbol: 'NVDAon',
            decimals: 18,
            issuer: 'Ondo',
          },
        ],
      },
    ])
  })

  it('leaves out a missing logo instead of sending it as null', () => {
    const [summary] = toAssetSummaries([{ ...NVDA, logoUrl: undefined }])

    expect(summary).not.toHaveProperty('logoUrl')
  })
})

describe('getAssetSummaries', () => {
  it('keeps every asset and token of the registry, in order', () => {
    const tokenKeys = (assets: { ticker: string; tokens: { chainId: number; address: string }[] }[]): string[] =>
      assets.flatMap(({ ticker, tokens }) => tokens.map(({ chainId, address }) => `${ticker}:${chainId}:${address}`))

    expect(tokenKeys(getAssetSummaries())).toEqual(tokenKeys(getAssets()))
  })
})
