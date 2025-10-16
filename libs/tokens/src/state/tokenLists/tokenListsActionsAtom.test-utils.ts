import { createStore } from 'jotai/vanilla'

import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  listsStatesByChainAtom,
  removedListsSourcesAtom,
  userAddedListsSourcesAtom,
} from './tokenListsStateAtom'

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

export type TestStore = ReturnType<typeof createStore>

export const DEFAULT_CHAIN_ID = SupportedChainId.MAINNET

export function setBaseState(store: TestStore = createStore(), envChainId: SupportedChainId = DEFAULT_CHAIN_ID): TestStore {
  const userAddedState = mapSupportedNetworks<Array<ListSourceConfig>>([])
  const removedState = mapSupportedNetworks<string[]>([])
  const listsState = mapSupportedNetworks(() => ({}) as TokenListsState) as TokenListsByChainState

  store.set(environmentAtom, { chainId: envChainId })
  store.set(userAddedListsSourcesAtom, userAddedState)
  store.set(removedListsSourcesAtom, removedState)
  store.set(listsStatesByChainAtom, listsState)

  return store
}

export function createListState(source: string, overrides: Partial<ListState> = {}): ListState {
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
