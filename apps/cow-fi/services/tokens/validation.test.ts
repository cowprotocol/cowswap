import { TextDecoder, TextEncoder } from 'util'

Object.assign(globalThis, { TextDecoder, TextEncoder })

const { isRawTokenData, normalizePlatformData, normalizePlatforms, normalizeTokenMarketCapRank } =
  require('./validation') as typeof import('./validation')

describe('token validation', () => {
  it('accepts only token payloads with the required string fields', () => {
    expect(
      isRawTokenData({
        id: 'cow-protocol',
        name: 'CoW Protocol',
        symbol: 'cow',
      }),
    ).toBe(true)

    expect(
      isRawTokenData({
        id: 'cow-protocol',
        name: 'CoW Protocol',
        symbol: 1,
      }),
    ).toBe(false)
  })

  it('keeps only valid EVM addresses in platform data', () => {
    expect(
      normalizePlatformData({
        contract_address: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
        decimal_place: 18,
      }),
    ).toEqual({
      contractAddress: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
      decimalPlace: 18,
    })

    expect(
      normalizePlatformData({
        contract_address: 'javascript:alert(1)',
        decimal_place: 18,
      }),
    ).toBeNull()
  })

  it('drops unsupported or malformed platform entries when building swap platforms', () => {
    expect(
      normalizePlatforms(
        {
          ethereum: {
            contract_address: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
          },
          'polygon-pos': {
            contract_address: 'not-an-address',
          },
        },
        ['ethereum', 'polygon-pos'],
      ),
    ).toEqual({
      ethereum: {
        contractAddress: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
        decimalPlace: 18,
      },
    })
  })

  it('normalizes market-cap rank only for positive integers', () => {
    expect(normalizeTokenMarketCapRank(12)).toBe(12)
    expect(normalizeTokenMarketCapRank(0)).toBeNull()
    expect(normalizeTokenMarketCapRank('12')).toBeNull()
  })
})
