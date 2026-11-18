import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getMissingRwaLists } from './getMissingRwaLists'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { ListState, TokenListsByChainState } from '../../types'

function listState(source: string): ListState {
  return {
    source,
    list: { name: source, timestamp: '2024-01-01T00:00:00Z', version: { major: 1, minor: 0, patch: 0 }, tokens: [] },
  }
}

function missingSources(state: Partial<TokenListsByChainState>): string[] {
  return getMissingRwaLists({ ...mapSupportedNetworks({}), ...state }).map(({ list }) => list.source)
}

function rwaListSource(chainId: SupportedChainId): string {
  return (DEFAULT_TOKENS_LISTS[chainId] || []).filter((list) => list.category === 'RWA')[0].source
}

describe('getMissingRwaLists', () => {
  const mainnetSource = rwaListSource(SupportedChainId.MAINNET)
  const baseSource = rwaListSource(SupportedChainId.BASE)

  it('returns the RWA list of every chain when nothing is stored', () => {
    const missing = getMissingRwaLists(mapSupportedNetworks({}))

    expect(missing).toContainEqual(expect.objectContaining({ chainId: SupportedChainId.MAINNET }))
    expect(missing).toContainEqual(expect.objectContaining({ chainId: SupportedChainId.BASE }))
    expect(missing.every(({ list }) => list.category === 'RWA')).toBe(true)
  })

  it('skips a chain whose RWA list is stored, even when disabled', () => {
    const missing = missingSources({
      [SupportedChainId.MAINNET]: { [mainnetSource]: { ...listState(mainnetSource), isEnabled: false } },
    })

    expect(missing).not.toContain(mainnetSource)
    expect(missing).toContain(baseSource)
  })

  it('treats an RWA list stored as deleted as missing, since it holds no tokens', () => {
    expect(missingSources({ [SupportedChainId.MAINNET]: { [mainnetSource]: 'deleted' } })).toContain(mainnetSource)
  })
})
