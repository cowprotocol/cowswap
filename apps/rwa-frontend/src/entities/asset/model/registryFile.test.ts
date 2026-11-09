import { decodeRegistry, type RwaAssetFile, type RwaRegistryFile } from './registryFile'

const TRADING_TIME = { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' }

const ASSET: RwaAssetFile = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  type: 'stock',
  priority: 1,
  allowedTradingTime: 3,
  profile: { description: 'Makes chips.', sector: 7 },
  tokens: [],
}

function fileWith(assets: RwaAssetFile[]): RwaRegistryFile {
  return {
    version: '0.1.0',
    lastModificationTime: '2026-09-28T00:00:00.000Z',
    allowedTradingTimes: { 3: TRADING_TIME },
    sectors: { 7: 'Information Technology · Semiconductors' },
    assets,
  }
}

describe('decodeRegistry', () => {
  it('resolves trading time and sector keys', () => {
    const { assets, ...rest } = decodeRegistry(
      fileWith([ASSET, { ...ASSET, ticker: 'XAU', allowedTradingTime: undefined, profile: undefined }]),
    )

    expect(rest).toEqual({ version: '0.1.0', lastModificationTime: '2026-09-28T00:00:00.000Z' })
    expect(assets[0].allowedTradingTime).toEqual(TRADING_TIME)
    expect(assets[0].profile).toEqual({
      description: 'Makes chips.',
      sector: 'Information Technology · Semiconductors',
    })
    expect(assets[1]).not.toHaveProperty('allowedTradingTime')
    expect(assets[1]).not.toHaveProperty('profile')
  })

  it('throws on an unknown key', () => {
    expect(() => decodeRegistry(fileWith([{ ...ASSET, allowedTradingTime: 0 }]))).toThrow(
      'RWAs.json NVDA.allowedTradingTime: unknown key 0',
    )
    expect(() => decodeRegistry(fileWith([{ ...ASSET, profile: { description: 'A.', sector: 1 } }]))).toThrow(
      'RWAs.json NVDA.profile.sector: unknown key 1',
    )
  })
})
