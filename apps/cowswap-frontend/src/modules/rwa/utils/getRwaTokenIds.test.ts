import { ListState, RWA_TOKENS_LIST_SOURCES } from '@cowprotocol/tokens'

import { getRwaTokenIds } from './getRwaTokenIds'

const createList = (source: string, chainId: number, address: string): ListState =>
  ({
    source,
    list: {
      name: source,
      timestamp: '2026-08-27T00:00:00.000Z',
      version: { major: 1, minor: 0, patch: 0 },
      tokens: [{ chainId, address, decimals: 18, symbol: 'TOKEN', name: 'Token' }],
    },
  }) as ListState

describe('getRwaTokenIds', () => {
  it('returns token IDs from RWA lists and excludes other lists', () => {
    const result = getRwaTokenIds([
      createList(RWA_TOKENS_LIST_SOURCES[0], 1, '0x0000000000000000000000000000000000000001'),
      createList('https://example.com/other.json', 1, '0x0000000000000000000000000000000000000002'),
    ])

    expect(result).toEqual(new Set(['1:0x0000000000000000000000000000000000000001']))
  })
})
