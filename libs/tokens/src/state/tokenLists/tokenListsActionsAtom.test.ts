import { createStore } from 'jotai/vanilla'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { removeListAtom } from './tokenListsActionsAtom'
import { listsStatesByChainAtom, removedListsSourcesAtom, userAddedListsSourcesAtom } from './tokenListsStateAtom'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { environmentAtom } from '../environmentAtom'

import type { ListSourceConfig, TokenListsState, TokenListsByChainState } from '../../types'

jest.mock('localforage', () => {
  const storage: Record<string, string | null> = {}

  return {
    createInstance: () => ({
      getItem: (key: string) => Promise.resolve(storage[key] ?? null),
      setItem: (key: string, value: string) => {
        storage[key] = value
        return Promise.resolve()
      },
      removeItem: (key: string) => {
        delete storage[key]
        return Promise.resolve()
      },
      clear: () => {
        Object.keys(storage).forEach((key) => delete storage[key])
        return Promise.resolve()
      },
    }),
  }
})

const chainId = SupportedChainId.MAINNET

type TestStore = ReturnType<typeof createStore>

function setBaseState(store: TestStore = createStore()): TestStore {
  const userAddedState = mapSupportedNetworks<Array<ListSourceConfig>>([])
  const removedState = mapSupportedNetworks<string[]>([])
  const listsState = mapSupportedNetworks(() => ({}) as TokenListsState) as TokenListsByChainState

  store.set(environmentAtom, { chainId })
  store.set(userAddedListsSourcesAtom, userAddedState)
  store.set(removedListsSourcesAtom, removedState)
  store.set(listsStatesByChainAtom, listsState)

  return store
}

describe('removeListAtom', () => {
  it('keeps default lists hidden when the user removes their user-added counterpart', async () => {
    const store = setBaseState()
    const defaultList = DEFAULT_TOKENS_LISTS[chainId]?.[0]

    if (!defaultList) {
      throw new Error('Expected MAINNET default token list for test setup')
    }

    const defaultListSource = defaultList.source
    const userAdded = mapSupportedNetworks<Array<ListSourceConfig>>([])

    userAdded[chainId] = [{ source: defaultListSource }]
    store.set(userAddedListsSourcesAtom, userAdded)

    await store.set(removeListAtom, defaultListSource)

    const removedLists = store.get(removedListsSourcesAtom)
    const userAddedLists = store.get(userAddedListsSourcesAtom)

    expect(removedLists[chainId]).toContain(defaultListSource.toLowerCase())
    expect(userAddedLists[chainId]).toHaveLength(0)
  })

  it('cleans up removed lists state for non-default user-added lists', async () => {
    const customSource = 'https://example.com/custom.json'
    const store = setBaseState()
    const userAdded = mapSupportedNetworks<Array<ListSourceConfig>>([])
    const removed = mapSupportedNetworks<string[]>([])

    userAdded[chainId] = [{ source: customSource }]
    removed[chainId] = [customSource.toLowerCase()]

    store.set(userAddedListsSourcesAtom, userAdded)
    store.set(removedListsSourcesAtom, removed)

    await store.set(removeListAtom, customSource)

    const removedLists = store.get(removedListsSourcesAtom)
    const userAddedLists = store.get(userAddedListsSourcesAtom)

    expect(removedLists[chainId]).not.toContain(customSource.toLowerCase())
    expect(userAddedLists[chainId]).toHaveLength(0)
  })
})
