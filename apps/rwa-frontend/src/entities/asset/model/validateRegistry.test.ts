/**
 * @jest-environment node
 */

import { getRegistry } from './registry'
import { validateRegistry } from './validateRegistry'

import type { RwaAsset, RwaRegistry } from './types'

const VALID_ASSET: RwaAsset = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  type: 'stock',
  priority: 1,
  allowedTradingTime: { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' },
  tokens: [
    {
      chainId: 1,
      address: '0x2D1F7226Bd1F780AF6B9A49DCC0aE00E8Df4bDEE',
      symbol: 'NVDAon',
      name: 'NVIDIA (Ondo Tokenized)',
      decimals: 18,
      issuer: 'Ondo',
    },
  ],
}

function registryWith(assets: RwaAsset[]): RwaRegistry {
  return { version: '0.1.0', lastModificationTime: '2026-09-28T00:00:00.000Z', assets }
}

describe('validateRegistry', () => {
  it('accepts data/RWAs.json', () => {
    expect(validateRegistry(getRegistry())).toEqual([])
  })

  it('accepts a valid asset', () => {
    expect(validateRegistry(registryWith([VALID_ASSET]))).toEqual([])
  })

  it('accepts an https logo and rejects other logo URLs', () => {
    expect(validateRegistry(registryWith([{ ...VALID_ASSET, logoUrl: 'https://example.com/nvda.png' }]))).toEqual([])
    expect(
      validateRegistry(
        registryWith([
          { ...VALID_ASSET, logoUrl: 'http://example.com/nvda.png' },
          { ...VALID_ASSET, ticker: 'AAPL', coingeckoId: 'apple', logoUrl: 'not a url' },
        ]),
      ),
    ).toEqual(['assets[0].logoUrl: must be an https URL', 'assets[1].logoUrl: must be an https URL'])
  })

  it('rejects duplicate tickers', () => {
    expect(validateRegistry(registryWith([VALID_ASSET, { ...VALID_ASSET, coingeckoId: 'nvidia-2' }]))).toEqual([
      'assets[1].ticker: duplicate "NVDA"',
    ])
  })

  it('rejects invalid asset fields', () => {
    const errors = validateRegistry(
      registryWith([
        {
          ...VALID_ASSET,
          ticker: 'nvda',
          priority: 11,
          allowedTradingTime: { title: 'US', start: '9:30', end: '20:00 UTC' },
          tokens: [{ ...VALID_ASSET.tokens[0], chainId: 999999, address: '0x123', issuer: '' }],
        },
      ]),
    )

    expect(errors).toEqual([
      'assets[0].ticker: must be uppercase, got "nvda"',
      'assets[0].priority: must be an integer from 0 to 10',
      'assets[0].allowedTradingTime: start/end must be "HH:mm UTC"',
      'assets[0].tokens[0].chainId: unsupported chain 999999',
      'assets[0].tokens[0].address: invalid address 0x123',
      'assets[0].tokens[0].issuer: required',
    ])
  })

  it('rejects an asset without tokens', () => {
    expect(validateRegistry(registryWith([{ ...VALID_ASSET, tokens: [] }]))).toEqual([
      'assets[0].tokens: at least one token is required',
    ])
  })

  it('rejects a missing coingeckoId', () => {
    expect(validateRegistry(registryWith([{ ...VALID_ASSET, coingeckoId: '' }]))).toEqual([
      'assets[0].coingeckoId: required',
    ])
  })

  it('rejects a duplicate coingeckoId', () => {
    expect(validateRegistry(registryWith([VALID_ASSET, { ...VALID_ASSET, ticker: 'NVDA2' }]))).toEqual([
      'assets[1].coingeckoId: duplicate "nvidia"',
    ])
  })
})
