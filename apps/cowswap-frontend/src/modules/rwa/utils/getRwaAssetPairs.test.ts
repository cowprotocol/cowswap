import { ListState, RWA_TOKENS_LIST_SOURCES } from '@cowprotocol/tokens'

import { getRwaAlternativeTokensByAddress, getRwaAssetPairs } from './getRwaAssetPairs'

const [ONDO_TOKENS_LIST_SOURCE, XSTOCKS_TOKENS_LIST_SOURCE] = RWA_TOKENS_LIST_SOURCES

const createList = (source: string, tokens: unknown[]): ListState =>
  ({
    source,
    list: {
      name: source,
      timestamp: '2026-08-27T00:00:00.000Z',
      version: { major: 1, minor: 0, patch: 0 },
      tokens,
    },
  }) as ListState

const toTokenInfo = (token: {
  chainId: number
  address: string
  symbol: string
}): { chainId: number; address: string; symbol: string; decimals: number; name: string } => ({
  ...token,
  decimals: 18,
  name: token.symbol,
})

const ONDO_AAPL = toTokenInfo({ chainId: 1, address: '0x0000000000000000000000000000000000000001', symbol: 'AAPLon' })
const XSTOCKS_AAPL = toTokenInfo({ chainId: 1, address: '0x0000000000000000000000000000000000000002', symbol: 'AAPLx' })
const ONDO_ONLY = toTokenInfo({ chainId: 1, address: '0x0000000000000000000000000000000000000003', symbol: 'GMEon' })

describe('getRwaAssetPairs', () => {
  it('groups tokens by their underlying asset, stripping platform suffixes', () => {
    const result = getRwaAssetPairs([
      createList(ONDO_TOKENS_LIST_SOURCE, [ONDO_AAPL, ONDO_ONLY]),
      createList(XSTOCKS_TOKENS_LIST_SOURCE, [XSTOCKS_AAPL]),
    ])

    expect(result).toEqual({
      '1:AAPL': { ondo: ONDO_AAPL, xstocks: XSTOCKS_AAPL },
      '1:GME': { ondo: ONDO_ONLY },
    })
  })

  it('ignores tokens from non-RWA lists', () => {
    const result = getRwaAssetPairs([createList('https://example.com/other.json', [ONDO_AAPL])])

    expect(result).toEqual({})
  })

  it('keeps same-symbol assets on different chains separate instead of overwriting each other', () => {
    const ondoAaplOtherChain = toTokenInfo({
      chainId: 56,
      address: '0x0000000000000000000000000000000000000004',
      symbol: 'AAPLon',
    })
    const xstocksAaplOtherChain = toTokenInfo({
      chainId: 56,
      address: '0x0000000000000000000000000000000000000005',
      symbol: 'AAPLx',
    })

    const result = getRwaAssetPairs([
      createList(ONDO_TOKENS_LIST_SOURCE, [ONDO_AAPL, ondoAaplOtherChain]),
      createList(XSTOCKS_TOKENS_LIST_SOURCE, [XSTOCKS_AAPL, xstocksAaplOtherChain]),
    ])

    expect(result).toEqual({
      '1:AAPL': { ondo: ONDO_AAPL, xstocks: XSTOCKS_AAPL },
      '56:AAPL': { ondo: ondoAaplOtherChain, xstocks: xstocksAaplOtherChain },
    })
  })
})

describe('getRwaAlternativeTokensByAddress', () => {
  it('maps each token to its counterpart on the other platform', () => {
    const pairs = getRwaAssetPairs([
      createList(ONDO_TOKENS_LIST_SOURCE, [ONDO_AAPL, ONDO_ONLY]),
      createList(XSTOCKS_TOKENS_LIST_SOURCE, [XSTOCKS_AAPL]),
    ])

    const result = getRwaAlternativeTokensByAddress(pairs)

    expect(result).toEqual({
      '1:0x0000000000000000000000000000000000000001': XSTOCKS_AAPL,
      '1:0x0000000000000000000000000000000000000002': ONDO_AAPL,
    })
  })
})
