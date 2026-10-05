import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  COW_CDN: 'https://cdn.cow.fi',
}))

jest.mock('../environmentAtom', () => {
  const { atom } = require('jotai')
  const { SupportedChainId } = require('@cowprotocol/cow-sdk')

  const environmentAtom = atom({
    chainId: SupportedChainId.MAINNET,
  })
  const updateEnvironmentAtom = atom(null, (get, set, update: Record<string, unknown>) => {
    set(environmentAtom, { ...get(environmentAtom), ...update })
  })

  return {
    environmentAtom,
    updateEnvironmentAtom,
  }
})

import { removeListAtom, upsertListsAtom } from './tokenListsActionsAtom'
import {
  allListsSourcesAtom,
  listsStatesByChainAtom,
  listsStatesMapAtom,
  virtualListsStateAtom,
} from './tokenListsStateAtom'

import { DEFAULT_TOKENS_LISTS, ONDO_TOKENS_LIST_SOURCE, XSTOCKS_TOKENS_LIST_SOURCE } from '../../const/tokensLists'
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
  [SupportedChainId.BNB]: {},
  [SupportedChainId.LINEA]: {},
  [SupportedChainId.PLASMA]: {},
}
const MOCK_CHAIN_ID = SupportedChainId.MAINNET
const REPIN_BASE = 'https://raw.githubusercontent.com/acme/tokenlist'

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

const MOCK_VIRTUAL_LIST_STATE: ListState = {
  source: 'widgetCustomTokens',
  widgetAppCode: 'widget-test',
  list: {
    name: 'Widget custom tokens',
    timestamp: '2024-01-01T00:00:00Z',
    version: { major: 1, minor: 0, patch: 0 },
    tokens: [
      {
        chainId: 1,
        address: '0x3234567890123456789012345678901234567890',
        name: 'Widget Token',
        symbol: 'WIDGET',
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
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, stateAllDeleted)

      const listsStatesMap = await store.get(listsStatesMapAtom)

      expect(Object.keys(listsStatesMap)).toHaveLength(0)
    })

    it('surfaces only the shipped URL when a list was re-pinned', async () => {
      const store = createStore()

      const shipped = DEFAULT_TOKENS_LISTS[MOCK_CHAIN_ID].find((list) => list.source.includes('ondoprotocol'))?.source

      if (!shipped) throw new Error('No SHA-pinned Ondo list configured for mainnet')

      // What a returning user still has stored from before the re-pin
      const repinned = shipped.replace(
        /^(https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/)[^/]+\//,
        '$1refs/heads/main/',
      )

      expect(repinned).not.toBe(shipped)

      store.set(environmentAtom, {
        chainId: MOCK_CHAIN_ID,
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [repinned]: { ...MOCK_LIST_STATE, source: repinned },
          [shipped]: { ...MOCK_LIST_STATE, source: shipped },
          [MOCK_LIST_STATE.source]: MOCK_LIST_STATE,
        },
      })

      const listsStatesMap = await store.get(listsStatesMapAtom)

      expect(listsStatesMap[shipped]).toBeDefined()
      expect(listsStatesMap[repinned]).toBeUndefined()
      // unrelated lists are untouched
      expect(listsStatesMap[MOCK_LIST_STATE.source]).toEqual(MOCK_LIST_STATE)
    })

    it('keeps one entry when a re-pinned list has no shipped URL stored', async () => {
      const store = createStore()

      const base = 'https://raw.githubusercontent.com/acme/tokenlist'
      const older = `${base}/refs/heads/master/tokenlist.json`
      const newer = `${base}/refs/heads/main/tokenlist.json`

      store.set(environmentAtom, {
        chainId: MOCK_CHAIN_ID,
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [older]: { ...MOCK_LIST_STATE, source: older },
          [newer]: { ...MOCK_LIST_STATE, source: newer },
        },
      })

      const listsStatesMap = await store.get(listsStatesMapAtom)

      expect(Object.keys(listsStatesMap)).toEqual([older])
    })

    it('keeps virtual widget lists when selected lists exclude them', async () => {
      const store = createStore()

      const stateWithoutWidgetLists: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [MOCK_LIST_STATE.source]: MOCK_LIST_STATE,
        },
      }

      store.set(environmentAtom, {
        chainId: MOCK_CHAIN_ID,
        widgetAppCode: 'widget-test',
        selectedLists: ['widgetcustomtokens'],
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, stateWithoutWidgetLists)
      store.set(virtualListsStateAtom, {
        [MOCK_VIRTUAL_LIST_STATE.source]: MOCK_VIRTUAL_LIST_STATE,
      })

      const listsStatesMap = await store.get(listsStatesMapAtom)

      expect(listsStatesMap[MOCK_VIRTUAL_LIST_STATE.source]).toEqual(MOCK_VIRTUAL_LIST_STATE)
      expect(listsStatesMap[MOCK_LIST_STATE.source]).toBeUndefined()
    })

    describe('RWA lists', () => {
      const ondoListState: ListState = { ...MOCK_LIST_STATE, source: ONDO_TOKENS_LIST_SOURCE }
      const repinnedXstocksSource = XSTOCKS_TOKENS_LIST_SOURCE.replace(/\/[0-9a-f]{40}\//, `/${'b'.repeat(40)}/`)
      const xstocksListState: ListState = { ...MOCK_LIST_STATE_2, source: repinnedXstocksSource }

      const stateWithRwaLists: TokenListsByChainState = {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [MOCK_LIST_STATE.source]: MOCK_LIST_STATE,
          [ondoListState.source]: ondoListState,
          [xstocksListState.source]: xstocksListState,
        },
      }

      it('hides stored RWA lists, including re-pinned ones, when RWA lists are excluded', async () => {
        const store = createStore()

        store.set(environmentAtom, { chainId: MOCK_CHAIN_ID, excludeRwaLists: true })
        store.set(listsStatesByChainAtom, stateWithRwaLists)

        const listsStatesMap = await store.get(listsStatesMapAtom)

        expect(Object.keys(listsStatesMap)).toEqual([MOCK_LIST_STATE.source])
      })

      it('keeps stored RWA lists when RWA lists are not excluded', async () => {
        const store = createStore()

        store.set(environmentAtom, { chainId: MOCK_CHAIN_ID, excludeRwaLists: false })
        store.set(listsStatesByChainAtom, stateWithRwaLists)

        const listsStatesMap = await store.get(listsStatesMapAtom)

        expect(Object.keys(listsStatesMap).sort()).toEqual(
          [MOCK_LIST_STATE.source, ondoListState.source, xstocksListState.source].sort(),
        )
      })
    })
  })

  describe('allListsSourcesAtom', () => {
    it('drops default RWA lists when RWA lists are excluded', () => {
      const store = createStore()

      store.set(environmentAtom, { chainId: MOCK_CHAIN_ID, excludeRwaLists: true })

      const sources = store.get(allListsSourcesAtom).map((list) => list.source)

      expect(sources).not.toContain(ONDO_TOKENS_LIST_SOURCE)
      expect(sources).not.toContain(XSTOCKS_TOKENS_LIST_SOURCE)
      expect(sources).toEqual(
        (DEFAULT_TOKENS_LISTS[MOCK_CHAIN_ID] || [])
          .filter((list) => list.category !== 'RWA')
          .map((list) => list.source),
      )
    })

    it('includes default RWA lists when RWA lists are not excluded', () => {
      const store = createStore()

      store.set(environmentAtom, { chainId: MOCK_CHAIN_ID, excludeRwaLists: false })

      const sources = store.get(allListsSourcesAtom).map((list) => list.source)

      expect(sources).toContain(ONDO_TOKENS_LIST_SOURCE)
      expect(sources).toContain(XSTOCKS_TOKENS_LIST_SOURCE)
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
        isYieldEnabled: false,
      })
      store.set(listsStatesByChainAtom, initialState)

      await store.set(removeListAtom, MOCK_LIST_STATE.source)

      const updatedState = await store.get(listsStatesByChainAtom)

      expect(updatedState?.[MOCK_CHAIN_ID]?.[MOCK_LIST_STATE.source]).toBe('deleted')
    })
  })

  describe('upsertListsAtom', () => {
    it('drops a re-pinned leftover from storage, not just from the rendered map', async () => {
      const store = createStore()

      const shipped = { ...MOCK_LIST_STATE, source: `${REPIN_BASE}/2222222222222222222222222222222222222222/l.json` }
      const leftover = { ...MOCK_LIST_STATE, source: `${REPIN_BASE}/refs/heads/main/l.json` }

      store.set(listsStatesByChainAtom, {
        ...DEFAULT_LISTS_STATE,
        [MOCK_CHAIN_ID]: {
          [leftover.source]: leftover,
          [MOCK_LIST_STATE.source]: MOCK_LIST_STATE,
        },
      })

      await store.set(upsertListsAtom, MOCK_CHAIN_ID, [shipped])

      const updatedState = await store.get(listsStatesByChainAtom)

      expect(updatedState?.[MOCK_CHAIN_ID]?.[shipped.source]).toBeDefined()
      expect(updatedState?.[MOCK_CHAIN_ID]?.[leftover.source]).toBeUndefined()
      expect(updatedState?.[MOCK_CHAIN_ID]?.[MOCK_LIST_STATE.source]).toEqual(MOCK_LIST_STATE)
    })

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
