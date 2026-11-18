import { SOLANA_RWA_TOKEN_LIST_URL, SOLANA_TOKEN_LIST_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TOKENS_LISTS, isRwaTokenListSource, SOLANA_RWA_TOKENS_LIST_SOURCE } from './tokensLists'

import { getSourceAsKey } from '../utils/getSourceAsKey'

/**
 * The copy shipped in `tokensList.json` and the one the rest of the app imports have to resolve to the
 * same key, or the explorer and the swap app read different lists.
 */
describe('Solana list sources', () => {
  it('ships the same URLs the app imports', () => {
    const sources = (DEFAULT_TOKENS_LISTS[SupportedChainId.SOLANA] || []).map((list) => getSourceAsKey(list.source))

    expect(sources).toContain(getSourceAsKey(SOLANA_TOKEN_LIST_URL))
    expect(sources).toContain(getSourceAsKey(SOLANA_RWA_TOKEN_LIST_URL))
  })

  it('resolves the RWA source to the RWA list, not to a neighbour', () => {
    expect(getSourceAsKey(SOLANA_RWA_TOKENS_LIST_SOURCE)).toBe(getSourceAsKey(SOLANA_RWA_TOKEN_LIST_URL))
  })
})

describe('DEFAULT_TOKENS_LISTS', () => {
  it('enables every RWA list by default', () => {
    const rwaLists = Object.values(DEFAULT_TOKENS_LISTS).flatMap((lists) =>
      (lists || []).filter((list) => list.category === 'RWA'),
    )

    expect(rwaLists.length).toBeGreaterThan(0)
    rwaLists.forEach((list) => expect(list.enabledByDefault).toBe(true))
  })
})

describe('isRwaTokenListSource', () => {
  it('recognizes every RWA list shipped in the config, whatever the casing', () => {
    const rwaSources = Object.values(DEFAULT_TOKENS_LISTS).flatMap((lists) =>
      (lists || []).filter((list) => list.category === 'RWA').map((list) => list.source),
    )

    expect(rwaSources.length).toBeGreaterThan(0)
    rwaSources.forEach((source) => expect(isRwaTokenListSource(source.toUpperCase())).toBe(true))
  })

  it('does not treat other lists as RWA', () => {
    expect(isRwaTokenListSource('https://files.cow.fi/token-lists/CoinGecko.1.json')).toBe(false)
    expect(isRwaTokenListSource(SOLANA_TOKEN_LIST_URL)).toBe(false)
  })
})
