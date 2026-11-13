import { createStore } from 'jotai'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { removeListAtom } from './tokenListsActionsAtom'
import { listsStatesByChainAtom } from './tokenListsStateAtom'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { ListState } from '../../types'
import { environmentAtom } from '../environmentAtom'

const CHAIN_ID = SupportedChainId.MAINNET
const RWA_LIST_SOURCE = (DEFAULT_TOKENS_LISTS[CHAIN_ID] || []).filter((list) => list.category === 'RWA')[0].source
const OTHER_LIST_SOURCE = 'https://example.com/tokenlist.json'

function listState(source: string): ListState {
  return {
    source,
    isEnabled: true,
    list: {
      name: source,
      timestamp: '2024-01-01T00:00:00Z',
      version: { major: 1, minor: 0, patch: 0 },
      tokens: [
        {
          chainId: CHAIN_ID,
          address: '0x1234567890123456789012345678901234567890',
          name: 'T',
          symbol: 'T',
          decimals: 18,
        },
      ],
    },
  }
}

async function removeList(source: string): Promise<ListState | 'deleted' | undefined> {
  const store = createStore()

  store.set(environmentAtom, { chainId: CHAIN_ID })
  store.set(listsStatesByChainAtom, {
    ...mapSupportedNetworks({}),
    [CHAIN_ID]: { [RWA_LIST_SOURCE]: listState(RWA_LIST_SOURCE), [OTHER_LIST_SOURCE]: listState(OTHER_LIST_SOURCE) },
  })

  await store.set(removeListAtom, source)

  return (await store.get(listsStatesByChainAtom))[CHAIN_ID]?.[source]
}

describe('removeListAtom', () => {
  it('deletes a regular list', async () => {
    expect(await removeList(OTHER_LIST_SOURCE)).toBe('deleted')
  })

  it('only disables an RWA list, keeping its tokens', async () => {
    const state = await removeList(RWA_LIST_SOURCE)

    expect(state).toEqual({ ...listState(RWA_LIST_SOURCE), isEnabled: false })
  })
})
