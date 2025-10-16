import { createListState, DEFAULT_CHAIN_ID, setBaseState } from './tokenListsActionsAtom.test-utils'
import { listsStatesByChainAtom, removedListsSourcesAtom, userAddedListsSourcesAtom } from './tokenListsStateAtom'

import { environmentAtom } from '../environmentAtom'

describe('tokenListsActionsAtom test utilities', () => {
  it('initializes base state with empty maps for the provided chain', async () => {
    const store = setBaseState()

    expect(store.get(environmentAtom).chainId).toBe(DEFAULT_CHAIN_ID)
    expect(store.get(userAddedListsSourcesAtom)[DEFAULT_CHAIN_ID]).toEqual([])
    expect(store.get(removedListsSourcesAtom)[DEFAULT_CHAIN_ID]).toEqual([])

    const listsState = await store.get(listsStatesByChainAtom)
    expect(listsState[DEFAULT_CHAIN_ID]).toEqual({})
  })

  it('creates list state with default metadata', () => {
    const listState = createListState('https://example.com/list.json')

    expect(listState.source).toBe('https://example.com/list.json')
    expect(listState.isEnabled).toBe(true)
    expect(listState.priority).toBe(1)
    expect(listState.list.version).toEqual({ major: 1, minor: 0, patch: 0 })
  })
})
