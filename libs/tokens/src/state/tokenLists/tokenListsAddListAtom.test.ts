import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import type { LpTokenProvider } from '@cowprotocol/types'

import { addListAtom } from './tokenListsActionsAtom'
import {
  createListState,
  DEFAULT_CHAIN_ID,
  setBaseState,
} from './tokenListsActionsAtom.test-utils'
import { removedListsSourcesAtom, userAddedListsSourcesAtom } from './tokenListsStateAtom'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'

const chainId = DEFAULT_CHAIN_ID

describe('addListAtom', () => {
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

    store.set(addListAtom, createListState(defaultListSource))

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
    const existingUserAdded = mapSupportedNetworks<Array<{ source: string; widgetAppCode?: string; priority?: number }>>(
      [],
    )

    existingUserAdded[chainId] = [
      {
        source: defaultListSource,
        widgetAppCode: 'widget-app',
        priority: 5,
      },
    ]

    store.set(userAddedListsSourcesAtom, existingUserAdded)

    const lpProvider = 'CURVE' as LpTokenProvider

    store.set(
      addListAtom,
      createListState(defaultListSource, { widgetAppCode: undefined, priority: 10, lpTokenProvider: lpProvider }),
    )

    const userAddedLists = store.get(userAddedListsSourcesAtom)
    const updatedEntry = userAddedLists[chainId]?.[0]

    expect(userAddedLists[chainId]).toHaveLength(1)
    expect(updatedEntry?.widgetAppCode).toBeUndefined()
    expect(updatedEntry?.priority).toBe(10)
    expect(updatedEntry?.lpTokenProvider).toBe(lpProvider)
  })
})
