import { atom, createStore } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState } from '@cowprotocol/tokens'

import { Field } from 'legacy/state/types'

// Controllable mock atoms – assigned inside jest.mock factories so they share
// the same atom references as the module under test.
// Must use `var` (not `let`/`const`) so they are hoisted and accessible when jest.mock factories run.
// eslint-disable-next-line no-var
var mockAllActiveTokensAtom: ReturnType<typeof atom<{ tokens: TokenWithLogo[] }>>
// eslint-disable-next-line no-var
var mockListsStatesMapAtom: ReturnType<
  typeof atom<Record<string, { source: string; list: { tokens: { address: string }[] } }>>
>
// eslint-disable-next-line no-var
var mockEnvironmentAtom: ReturnType<typeof atom<{ sellSelectedLists?: string[]; buySelectedLists?: string[] }>>
// eslint-disable-next-line no-var
var mockSelectTokenWidgetAtom: ReturnType<typeof atom<{ field?: Field }>>

jest.mock('@cowprotocol/tokens', () => {
  const { atom } = require('jotai')
  mockAllActiveTokensAtom = atom({ tokens: [] as TokenWithLogo[] })
  mockListsStatesMapAtom = atom({} as Record<string, never>)
  mockEnvironmentAtom = atom({} as { sellSelectedLists?: string[]; buySelectedLists?: string[] })
  return {
    allActiveTokensAtom: mockAllActiveTokensAtom,
    listsStatesMapAtom: mockListsStatesMapAtom,
    environmentAtom: mockEnvironmentAtom,
  }
})

jest.mock('./selectTokenWidgetAtom', () => {
  const { atom } = require('jotai')
  mockSelectTokenWidgetAtom = atom({ field: undefined as Field | undefined })
  return { selectTokenWidgetAtom: mockSelectTokenWidgetAtom }
})

// Import AFTER mocks are registered
import { tokensToSelectAtom } from './tokensToSelectAtom'

const token1 = { address: '0xaaa111', chainId: 1, decimals: 18, symbol: 'TK1', name: 'Token 1' } as TokenWithLogo
const token2 = { address: '0xbbb222', chainId: 1, decimals: 18, symbol: 'TK2', name: 'Token 2' } as TokenWithLogo
const token3 = { address: '0xccc333', chainId: 1, decimals: 18, symbol: 'TK3', name: 'Token 3' } as TokenWithLogo

const LIST_A = 'https://example.com/list-a.json'
const LIST_B = 'https://example.com/list-b.json'

function makeListState(source: string, tokenAddresses: string[]): ListState {
  return { source, list: { tokens: tokenAddresses.map((address) => ({ address })) } } as ListState
}

describe('tokensToSelectAtom', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
    store.set(mockAllActiveTokensAtom, { tokens: [token1, token2, token3] })
    store.set(mockListsStatesMapAtom, {})
    store.set(mockEnvironmentAtom, {})
    store.set(mockSelectTokenWidgetAtom, { field: Field.INPUT })
  })

  it('returns all tokens when no selected lists are configured', async () => {
    const result = await store.get(tokensToSelectAtom)
    expect(result).toEqual([token1, token2, token3])
  })

  describe('sell field (Field.INPUT)', () => {
    beforeEach(() => {
      store.set(mockSelectTokenWidgetAtom, { field: Field.INPUT })
    })

    it('filters tokens by sellSelectedLists', async () => {
      store.set(mockEnvironmentAtom, { sellSelectedLists: [LIST_A] })
      store.set(mockListsStatesMapAtom, {
        [LIST_A]: makeListState(LIST_A, [token1.address, token2.address]),
        [LIST_B]: makeListState(LIST_B, [token3.address]),
      })

      const result = await store.get(tokensToSelectAtom)
      expect(result).toEqual([token1, token2])
    })
  })

  describe('buy field (Field.OUTPUT)', () => {
    beforeEach(() => {
      store.set(mockSelectTokenWidgetAtom, { field: Field.OUTPUT })
    })

    it('filters tokens by buySelectedLists', async () => {
      store.set(mockEnvironmentAtom, { buySelectedLists: [LIST_B] })
      store.set(mockListsStatesMapAtom, {
        [LIST_A]: makeListState(LIST_A, [token1.address]),
        [LIST_B]: makeListState(LIST_B, [token2.address, token3.address]),
      })

      const result = await store.get(tokensToSelectAtom)
      expect(result).toEqual([token2, token3])
    })
  })
})
