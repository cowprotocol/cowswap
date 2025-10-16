import { createStore } from 'jotai/vanilla'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { addListAtom, removeListAtom } from './tokenListsActionsAtom'
import {
  listsStatesByChainAtom,
  listsStatesMapAtom,
  removedListsSourcesAtom,
  userAddedListsSourcesAtom,
} from './tokenListsStateAtom'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { environmentAtom } from '../environmentAtom'

import type { ListSourceConfig, ListState, TokenListsState, TokenListsByChainState } from '../../types'

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

function createListState(source: string, overrides: Partial<ListState> = {}): ListState {
  return {
    source,
    list: {
      name: 'Test List',
      logoURI: '',
      keywords: [],
      timestamp: '2024-01-01T00:00:00.000Z',
      version: { major: 1, minor: 0, patch: 0 },
      tokens: [],
    },
    isEnabled: true,
    priority: 1,
    ...overrides,
  }
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

  it('keeps removed predefined lists hidden in listsStatesMapAtom after refresh', async () => {
    const store = setBaseState()
    const defaultList = DEFAULT_TOKENS_LISTS[chainId]?.[0]

    if (!defaultList) {
      throw new Error('Expected MAINNET default token list for test setup')
    }

    const defaultListSource = defaultList.source
    const listState = createListState(defaultListSource)

    const listsState = mapSupportedNetworks(() => ({} as TokenListsState)) as TokenListsByChainState
    listsState[chainId] = { [defaultListSource]: listState }

    const userAdded = mapSupportedNetworks<Array<ListSourceConfig>>([])
    userAdded[chainId] = [{ source: defaultListSource }]

    store.set(userAddedListsSourcesAtom, userAdded)
    store.set(listsStatesByChainAtom, listsState)

    await store.set(removeListAtom, defaultListSource)

    const refreshedState = mapSupportedNetworks(() => ({} as TokenListsState)) as TokenListsByChainState
    refreshedState[chainId] = { [defaultListSource]: listState }

    store.set(listsStatesByChainAtom, refreshedState)

    const listsMap = await store.get(listsStatesMapAtom)

    expect(listsMap[defaultListSource]).toBeUndefined()
  })

  it('re-adding a previously removed default list clears removed state', async () => {
    const store = setBaseState()
    const defaultList = DEFAULT_TOKENS_LISTS[chainId]?.[0]

    if (!defaultList) {
      throw new Error('Expected MAINNET default token list for test setup')
    }

    const defaultListSource = defaultList.source
    const defaultListSourceLower = defaultListSource.toLowerCase()
    const removedState = mapSupportedNetworks<string[]>([])

    removedState[chainId] = [defaultListSourceLower]

    store.set(removedListsSourcesAtom, removedState)

    await store.set(
      addListAtom,
      createListState(defaultListSource),
    )

    const removedLists = store.get(removedListsSourcesAtom)

    expect(removedLists[chainId]).not.toContain(defaultListSourceLower)
  })

  it('updates metadata for existing user-added lists when re-adding', async () => {
    const store = setBaseState()
    const defaultList = DEFAULT_TOKENS_LISTS[chainId]?.[0]

    if (!defaultList) {
      throw new Error('Expected MAINNET default token list for test setup')
    }

    const defaultListSource = defaultList.source
    const existingUserAdded = mapSupportedNetworks<Array<ListSourceConfig>>([])

    existingUserAdded[chainId] = [
      {
        source: defaultListSource,
        widgetAppCode: 'widget-app',
        priority: 5,
      },
    ]

    store.set(userAddedListsSourcesAtom, existingUserAdded)

    await store.set(
      addListAtom,
      createListState(defaultListSource, { widgetAppCode: undefined, priority: 10 }),
    )

    const userAddedLists = store.get(userAddedListsSourcesAtom)
    const updatedEntry = userAddedLists[chainId]?.[0]

    expect(userAddedLists[chainId]).toHaveLength(1)
    expect(updatedEntry?.widgetAppCode).toBeUndefined()
    expect(updatedEntry?.priority).toBe(10)
  })
})
