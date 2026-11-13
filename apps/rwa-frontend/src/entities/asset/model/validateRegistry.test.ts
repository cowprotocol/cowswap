/**
 * @jest-environment node
 */

import { getRegistry } from './registry'
import { validateRegistry } from './validateRegistry'

import type { RwaAsset, RwaRegistry, RwaTradingTime } from './types'

const VALID_ASSET: RwaAsset = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  type: 'stock',
  priority: 1,
  allowedTradingTime: { title: 'US market open', start: '09:30', end: '16:00', timeZone: 'America/New_York' },
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

  it('accepts a profile with or without a website', () => {
    const profile = { description: 'Makes chips.', sector: 'Information Technology · Semiconductors' }

    expect(validateRegistry(registryWith([{ ...VALID_ASSET, profile }]))).toEqual([])
    expect(
      validateRegistry(registryWith([{ ...VALID_ASSET, profile: { ...profile, website: 'https://www.nvidia.com' } }])),
    ).toEqual([])
  })

  it('rejects a sector outside the GICS groups', () => {
    const withSector = (sector: string): RwaAsset => ({
      ...VALID_ASSET,
      profile: { description: 'Makes chips.', sector },
    })

    expect(validateRegistry(registryWith([withSector('ETF · US Large Cap')]))).toEqual([])
    expect(validateRegistry(registryWith([withSector('Technology · Semiconductors')]))).toEqual([
      'assets[0].profile.sector: must start with one of Communication Services, Consumer Discretionary, Consumer Staples, Energy, Financials, Health Care, Industrials, Information Technology, Materials, Real Estate, Utilities, ETF followed by " · "',
    ])
    expect(validateRegistry(registryWith([withSector('Information Technology')]))).toHaveLength(1)
  })

  it('rejects an incomplete profile and a non-https website', () => {
    expect(
      validateRegistry(
        registryWith([{ ...VALID_ASSET, profile: { description: '', sector: '', website: 'http://nvidia.com' } }]),
      ),
    ).toEqual([
      'assets[0].profile.description: required',
      'assets[0].profile.sector: required',
      'assets[0].profile.website: must be an https URL',
    ])
  })

  it('rejects an unsafe profile description', () => {
    expect(
      validateRegistry(
        registryWith([
          {
            ...VALID_ASSET,
            profile: { description: 'Claim at nvidia-claim.xyz.', sector: 'Information Technology · Semiconductors' },
          },
        ]),
      ),
    ).toEqual(['assets[0].profile.description: must not contain links or domains'])
  })

  it('accepts an https news feed and rejects an incomplete one', () => {
    const newsFeed = { source: 'NVIDIA Newsroom', url: 'https://nvidianews.nvidia.com/releases.xml' }

    expect(validateRegistry(registryWith([{ ...VALID_ASSET, newsFeed }]))).toEqual([])
    expect(
      validateRegistry(registryWith([{ ...VALID_ASSET, newsFeed: { source: '', url: 'http://example.com/rss' } }])),
    ).toEqual(['assets[0].newsFeed.source: required', 'assets[0].newsFeed.url: must be an https URL'])
  })

  it('rejects a trading time in an unknown time zone', () => {
    const allowedTradingTime = { title: 'US market open', start: '09:30', end: '16:00', timeZone: 'Eastern' }

    expect(validateRegistry(registryWith([{ ...VALID_ASSET, allowedTradingTime }]))).toEqual([
      'assets[0].allowedTradingTime: start/end must be "HH:mm" in a valid timeZone',
    ])
  })

  it('rejects a trading time without a time zone', () => {
    const allowedTradingTime = { title: 'US market open', start: '09:30', end: '16:00' } as RwaTradingTime

    expect(validateRegistry(registryWith([{ ...VALID_ASSET, allowedTradingTime }]))).toEqual([
      'assets[0].allowedTradingTime: start/end must be "HH:mm" in a valid timeZone',
    ])
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
          allowedTradingTime: { title: 'US', start: '9:30', end: '16:00', timeZone: 'America/New_York' },
          tokens: [{ ...VALID_ASSET.tokens[0], chainId: 999999, address: '0x123', issuer: '' }],
        },
      ]),
    )

    expect(errors).toEqual([
      'assets[0].ticker: must be uppercase, got "nvda"',
      'assets[0].priority: must be an integer from 0 to 10',
      'assets[0].allowedTradingTime: start/end must be "HH:mm" in a valid timeZone',
      'assets[0].tokens[0].chainId: unsupported chain 999999',
      'assets[0].tokens[0].address: invalid address 0x123',
      'assets[0].tokens[0].issuer: required',
    ])
  })

  it('accepts tokens of any issuer', () => {
    const [token] = VALID_ASSET.tokens

    expect(validateRegistry(registryWith([{ ...VALID_ASSET, tokens: [{ ...token, issuer: 'Dinari' }] }]))).toEqual([])
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
