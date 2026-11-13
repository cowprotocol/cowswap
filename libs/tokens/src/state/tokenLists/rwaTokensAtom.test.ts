import { createStore } from 'jotai'

import { getTokenId, mapSupportedNetworks, SupportedChainId, TokenId } from '@cowprotocol/cow-sdk'

import { RwaToken, rwaTokensAtom } from './rwaTokensAtom'
import { listsStatesByChainAtom } from './tokenListsStateAtom'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { ListState, TokenListsByChainState } from '../../types'
import { environmentAtom } from '../environmentAtom'

const OTHER_LIST_SOURCE = 'https://example.com/tokenlist.json'
const MAINNET_RWA_ADDRESS = '0x1234567890123456789012345678901234567890'
const BASE_RWA_ADDRESS = '0x3234567890123456789012345678901234567890'
const OTHER_ADDRESS = '0x2234567890123456789012345678901234567890'

function createListState(source: string, tokens: RwaToken[]): ListState {
  return {
    source,
    list: {
      name: 'Test list',
      timestamp: '2024-01-01T00:00:00Z',
      version: { major: 1, minor: 0, patch: 0 },
      tokens,
    },
  }
}

async function getRwaTokenIds(state: Partial<TokenListsByChainState>): Promise<TokenId[]> {
  const store = createStore()

  store.set(environmentAtom, { chainId: SupportedChainId.MAINNET })
  store.set(listsStatesByChainAtom, { ...mapSupportedNetworks({}), ...state })

  return [...(await store.get(rwaTokensAtom)).keys()]
}

function rwaListSource(chainId: SupportedChainId): string {
  return (DEFAULT_TOKENS_LISTS[chainId] || []).filter((list) => list.category === 'RWA')[0].source
}

function token(chainId: SupportedChainId, address: string): RwaToken {
  return { chainId, address, name: 'Token', symbol: 'TKN', decimals: 18 }
}

describe('rwaTokensAtom', () => {
  it('collects the RWA list tokens of every chain, not only the current one', async () => {
    const mainnetSource = rwaListSource(SupportedChainId.MAINNET)
    const baseSource = rwaListSource(SupportedChainId.BASE)

    const ids = await getRwaTokenIds({
      [SupportedChainId.MAINNET]: {
        [mainnetSource]: createListState(mainnetSource, [token(SupportedChainId.MAINNET, MAINNET_RWA_ADDRESS)]),
      },
      [SupportedChainId.BASE]: {
        [baseSource]: createListState(baseSource, [token(SupportedChainId.BASE, BASE_RWA_ADDRESS)]),
      },
    })

    expect(ids).toEqual([
      getTokenId({ chainId: SupportedChainId.MAINNET, address: MAINNET_RWA_ADDRESS }),
      getTokenId({ chainId: SupportedChainId.BASE, address: BASE_RWA_ADDRESS }),
    ])
  })

  it('keys tokens by their own chain, so the same address on another chain is not an RWA', async () => {
    const baseSource = rwaListSource(SupportedChainId.BASE)

    const ids = await getRwaTokenIds({
      [SupportedChainId.BASE]: {
        [baseSource]: createListState(baseSource, [token(SupportedChainId.BASE, BASE_RWA_ADDRESS)]),
      },
    })

    expect(ids).not.toContain(getTokenId({ chainId: SupportedChainId.MAINNET, address: BASE_RWA_ADDRESS }))
  })

  it('ignores non-RWA lists and deleted RWA lists', async () => {
    const mainnetSource = rwaListSource(SupportedChainId.MAINNET)

    const ids = await getRwaTokenIds({
      [SupportedChainId.MAINNET]: {
        [mainnetSource]: 'deleted',
        [OTHER_LIST_SOURCE]: createListState(OTHER_LIST_SOURCE, [token(SupportedChainId.MAINNET, OTHER_ADDRESS)]),
      },
    })

    expect(ids).toEqual([])
  })
})
