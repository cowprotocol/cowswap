import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { removeListAtom, upsertListsAtom } from './tokenListsActionsAtom'
import { listsStatesByChainAtom, listsStatesMapAtom } from './tokenListsStateAtom'

import { ListState, TokenListsByChainState } from '../../types'
import { environmentAtom } from '../environmentAtom'

const DEFAULT_LISTS_STATE = {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
  [SupportedChainId.ARBITRUM_ONE]: {},
  [SupportedChainId.BASE]: {},
  [SupportedChainId.SEPOLIA]: {},
  [SupportedChainId.POLYGON]: {},
  [SupportedChainId.AVALANCHE]: {},
  [SupportedChainId.LENS]: {},
  [SupportedChainId.BNB]: {},
  [SupportedChainId.LINEA]: {},
  [SupportedChainId.PLASMA]: {},
}
const MOCK_CHAIN_ID = SupportedChainId.MAINNET

const MOCK_LIST_STATE: ListState = {
  source: 'https://example.com/tokenlist.json',
  priority: 1,
  list: {
    name: 'Test List',
    timestamp: '2024-01-01T00:00:00Z',
    version: { major: 1, minor: 0, patch: 0 },
    tokens: [
      {
        chainId: 1,
        address: '0x1234567890123456789012345678901234567890',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
      },
    ],
  },
  isEnabled: true,
}

const MOCK_LIST_STATE_2: ListState = {
  source: 'https://example.com/tokenlist2.json',
  priority: 2,
  list: {
    name: 'Test List 2',
    timestamp: '2024-01-01T00:00:00Z',
    version: { major: 1, minor: 0, patch: 0 },
    tokens: [
      {
        chainId: 1,
        address: '0x2234567890123456789012345678901234567890',
        name: 'Test Token 2',
        symbol: 'TEST2',
        decimals: 18,
      },
    ],
  },
  isEnabled: true,
}

describe('listsStatesByChainAtom - token lists state', () => {
  describe('listsStatesMapAtom', () => {
    it('filters out deleted entries from the list state', async () => {
      const store = createStore()

      const stateWithDeleted: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [MOCK_LIST_STATE.source]: MOCK_LIST_STATE,
          [MOCK_LIST_STATE_2.source]: 'deleted',
        },
      }

      store.set(environmentAtom, {
        chainId: MOCK_CHAIN_ID,
        useCuratedListOnly: false,
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, stateWithDeleted)

      const listsStatesMap = await store.get(listsStatesMapAtom)

      expect(listsStatesMap[MOCK_LIST_STATE.source]).toEqual(MOCK_LIST_STATE)
      expect(listsStatesMap[MOCK_LIST_STATE_2.source]).toBeUndefined()
    })

    it('returns all entries when none are deleted', async () => {
      const store = createStore()

      const stateWithoutDeleted: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [MOCK_LIST_STATE.source]: MOCK_LIST_STATE,
          [MOCK_LIST_STATE_2.source]: MOCK_LIST_STATE_2,
        },
      }

      store.set(environmentAtom, {
        chainId: MOCK_CHAIN_ID,
        useCuratedListOnly: false,
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, stateWithoutDeleted)

      const listsStatesMap = await store.get(listsStatesMapAtom)

      expect(Object.keys(listsStatesMap)).toHaveLength(2)
      expect(listsStatesMap[MOCK_LIST_STATE.source]).toEqual(MOCK_LIST_STATE)
      expect(listsStatesMap[MOCK_LIST_STATE_2.source]).toEqual(MOCK_LIST_STATE_2)
    })

    it('returns empty object when all entries are deleted', async () => {
      const store = createStore()

      const stateAllDeleted: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [MOCK_LIST_STATE.source]: 'deleted',
          [MOCK_LIST_STATE_2.source]: 'deleted',
        },
      }

      store.set(environmentAtom, {
        chainId: MOCK_CHAIN_ID,
        useCuratedListOnly: false,
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, stateAllDeleted)

      const listsStatesMap = await store.get(listsStatesMapAtom)

      expect(Object.keys(listsStatesMap)).toHaveLength(0)
    })
  })

  describe('removeListAtom', () => {
    it('sets the list state to "deleted" when removing a list', async () => {
      const store = createStore()

      const initialState: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [MOCK_LIST_STATE.source]: MOCK_LIST_STATE,
        },
      }

      store.set(environmentAtom, {
        chainId: MOCK_CHAIN_ID,
        useCuratedListOnly: false,
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, initialState)

      await store.set(removeListAtom, MOCK_LIST_STATE.source)

      const updatedState = await store.get(listsStatesByChainAtom)

      expect(updatedState?.[MOCK_CHAIN_ID]?.[MOCK_LIST_STATE.source]).toBe('deleted')
    })
  })

  describe('upsertListsAtom', () => {
    it('restores a list that was marked as deleted with isEnabled defaulting to true', async () => {
      const store = createStore()

      const initialState: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [MOCK_LIST_STATE.source]: 'deleted',
        },
      }

      store.set(listsStatesByChainAtom, initialState)

      const listWithoutEnabled = { ...MOCK_LIST_STATE }
      delete listWithoutEnabled.isEnabled

      await store.set(upsertListsAtom, MOCK_CHAIN_ID, [listWithoutEnabled])

      const updatedState = await store.get(listsStatesByChainAtom)

      // Should be restored with isEnabled defaulting to true
      expect(updatedState?.[MOCK_CHAIN_ID]?.[MOCK_LIST_STATE.source]).toEqual({
        ...listWithoutEnabled,
        isEnabled: true,
      })
    })

    it('upserts a new list that does not exist in state', async () => {
      const store = createStore()

      const initialState: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {},
      }

      store.set(listsStatesByChainAtom, initialState)

      await store.set(upsertListsAtom, MOCK_CHAIN_ID, [MOCK_LIST_STATE])

      const updatedState = await store.get(listsStatesByChainAtom)

      expect(updatedState?.[MOCK_CHAIN_ID]?.[MOCK_LIST_STATE.source]).toEqual(MOCK_LIST_STATE)
    })
  })

  describe('integration: delete and restore workflow', () => {
    it('allows deleted list to be restored via upsert with isEnabled defaulting to true', async () => {
      const store = createStore()

      const initialState: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [MOCK_LIST_STATE.source]: MOCK_LIST_STATE,
        },
      }

      store.set(environmentAtom, {
        chainId: MOCK_CHAIN_ID,
        useCuratedListOnly: false,
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, initialState)

      // Remove the list (sets to deleted)
      await store.set(removeListAtom, MOCK_LIST_STATE.source)

      const state = await store.get(listsStatesByChainAtom)
      expect(state?.[MOCK_CHAIN_ID]?.[MOCK_LIST_STATE.source]).toBe('deleted')

      // Upsert the same list - should restore it
      await store.set(upsertListsAtom, MOCK_CHAIN_ID, [MOCK_LIST_STATE])

      const stateUpdate = await store.get(listsStatesByChainAtom)
      // Should be restored with the list data
      expect(stateUpdate?.[MOCK_CHAIN_ID]?.[MOCK_LIST_STATE.source]).toEqual(MOCK_LIST_STATE)
    })
  })
})
