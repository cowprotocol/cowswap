import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { removeListAtom } from './tokenListsActionsAtom'
import { createListState, DEFAULT_CHAIN_ID, setBaseState } from './tokenListsActionsAtom.test-utils'
import {
  listsStatesByChainAtom,
  listsStatesMapAtom,
  removedListsSourcesAtom,
  userAddedListsSourcesAtom,
} from './tokenListsStateAtom'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { environmentAtom } from '../environmentAtom'

import type { ListSourceConfig, TokenListsState, TokenListsByChainState } from '../../types'

const chainId = DEFAULT_CHAIN_ID

afterEach(() => {
  const { __resetStorage } = require('localforage')

  __resetStorage()
})

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

    const listsState = mapSupportedNetworks(() => ({}) as TokenListsState) as TokenListsByChainState
    listsState[chainId] = { [defaultListSource]: listState }

    const userAdded = mapSupportedNetworks<Array<ListSourceConfig>>([])
    userAdded[chainId] = [{ source: defaultListSource }]

    store.set(userAddedListsSourcesAtom, userAdded)
    store.set(listsStatesByChainAtom, listsState)

    await store.set(removeListAtom, defaultListSource)

    const refreshedState = mapSupportedNetworks(() => ({}) as TokenListsState) as TokenListsByChainState
    refreshedState[chainId] = { [defaultListSource]: listState }

    store.set(listsStatesByChainAtom, refreshedState)

    const listsMap = await store.get(listsStatesMapAtom)

    expect(listsMap[defaultListSource]).toBeUndefined()
  })

  it('treats user-added sources case-insensitively when removing', async () => {
    const store = setBaseState()
    const source = 'https://Example.com/List.JSON'
    const sourceLower = source.toLowerCase()
    const userAdded = mapSupportedNetworks<Array<ListSourceConfig>>([])
    const listsState = mapSupportedNetworks(() => ({} as TokenListsState)) as TokenListsByChainState

    userAdded[chainId] = [{ source }]
    listsState[chainId] = { [source]: createListState(source) }
    store.set(userAddedListsSourcesAtom, userAdded)
    store.set(listsStatesByChainAtom, listsState)

    await store.set(removeListAtom, sourceLower)

    const userAddedLists = store.get(userAddedListsSourcesAtom)
    const updatedListsState = await store.get(listsStatesByChainAtom)
    expect(userAddedLists[chainId]).toHaveLength(0)
    expect(store.get(removedListsSourcesAtom)[chainId]).not.toContain(sourceLower)
    expect(updatedListsState[chainId]?.[source]).toBeUndefined()
  })

  it('removes predefined lists that were not user-added and keeps them hidden after refresh', async () => {
    const store = setBaseState()
    const defaultList = DEFAULT_TOKENS_LISTS[chainId]?.[0]

    if (!defaultList) {
      throw new Error('Expected MAINNET default token list for test setup')
    }

    const defaultListSource = defaultList.source
    const defaultListSourceLower = defaultListSource.toLowerCase()
    const listState = createListState(defaultListSource)

    const listsState = mapSupportedNetworks(() => ({}) as TokenListsState) as TokenListsByChainState
    listsState[chainId] = { [defaultListSource]: listState }

    store.set(listsStatesByChainAtom, listsState)

    await store.set(removeListAtom, defaultListSource)

    const removedLists = store.get(removedListsSourcesAtom)
    expect(removedLists[chainId]).toContain(defaultListSourceLower)

    const refreshedState = mapSupportedNetworks(() => ({}) as TokenListsState) as TokenListsByChainState
    refreshedState[chainId] = { [defaultListSource]: listState }
    store.set(listsStatesByChainAtom, refreshedState)

    const listsMap = await store.get(listsStatesMapAtom)

    expect(listsMap[defaultListSource]).toBeUndefined()
  })

  it('keeps removals isolated to the active chain', async () => {
    const otherChainId = SupportedChainId.GNOSIS_CHAIN
    const store = setBaseState()
    const mainnetDefault = DEFAULT_TOKENS_LISTS[chainId]?.[0]
    const otherChainDefault = DEFAULT_TOKENS_LISTS[otherChainId]?.[0]

    if (!mainnetDefault || !otherChainDefault) {
      throw new Error('Expected default token lists for both chains')
    }

    const mainnetSource = mainnetDefault.source
    const mainnetSourceLower = mainnetSource.toLowerCase()
    const otherChainSource = otherChainDefault.source

    const listsState = mapSupportedNetworks(() => ({}) as TokenListsState) as TokenListsByChainState
    listsState[chainId] = { [mainnetSource]: createListState(mainnetSource) }
    listsState[otherChainId] = { [otherChainSource]: createListState(otherChainSource) }

    store.set(listsStatesByChainAtom, listsState)

    await store.set(removeListAtom, mainnetSource)

    const removedLists = store.get(removedListsSourcesAtom)
    expect(removedLists[chainId]).toContain(mainnetSourceLower)
    expect(removedLists[otherChainId]).toEqual([])

    store.set(environmentAtom, { chainId: otherChainId })

    const otherChainListsMap = await store.get(listsStatesMapAtom)
    expect(otherChainListsMap[otherChainSource]).toBeDefined()

    store.set(environmentAtom, { chainId })
  })
})
