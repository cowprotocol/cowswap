/**
 * @jest-environment node
 */
import { getRegistry } from './registry'
import { buildRwaTokenList } from './tokenList'

describe('buildRwaTokenList', () => {
  it('lists every registry token with its asset ticker', () => {
    const registry = getRegistry()
    const tokenList = buildRwaTokenList(registry)

    expect(tokenList.tokens).toHaveLength(registry.assets.reduce((sum, asset) => sum + asset.tokens.length, 0))
    expect(tokenList.tokens[0]).toEqual({
      chainId: registry.assets[0].tokens[0].chainId,
      address: registry.assets[0].tokens[0].address,
      symbol: registry.assets[0].tokens[0].symbol,
      name: registry.assets[0].tokens[0].name,
      decimals: registry.assets[0].tokens[0].decimals,
      extensions: { ticker: registry.assets[0].ticker },
    })
  })

  it('takes the version and timestamp from the registry', () => {
    const tokenList = buildRwaTokenList({
      version: '1.2.3',
      lastModificationTime: '2026-09-28T00:00:00.000Z',
      assets: [],
    })

    expect(tokenList).toEqual({
      name: 'CoW RWA',
      timestamp: '2026-09-28T00:00:00.000Z',
      version: { major: 1, minor: 2, patch: 3 },
      tokens: [],
    })
  })
})
