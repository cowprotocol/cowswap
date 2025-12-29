import { createStore } from 'jotai'
import { Provider } from 'jotai'
import { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'

import { useFilterBlockedLists } from './useFilterBlockedLists'
import { normalizeListSource } from './useIsListBlocked'

import { restrictedListsAtom, RestrictedListsState } from '../../state/restrictedTokens/restrictedTokensAtom'
import { ListState } from '../../types'

const MOCK_ONDO_LIST_URL =
  'https://raw.githubusercontent.com/ondoprotocol/cowswap-global-markets-token-list/main/tokenlist.json'
const MOCK_COWSWAP_LIST_URL = 'https://tokens.cowhub.io/cowswap.json'

const createMockListState = (source: string, name: string): ListState => ({
  source,
  priority: 1,
  list: {
    name,
    timestamp: '2024-01-01T00:00:00Z',
    version: { major: 1, minor: 0, patch: 0 },
    tokens: [],
  },
  isEnabled: true,
})

const MOCK_ONDO_LIST = createMockListState(MOCK_ONDO_LIST_URL, 'Ondo List')
const MOCK_COWSWAP_LIST = createMockListState(MOCK_COWSWAP_LIST_URL, 'CowSwap List')

const MOCK_RESTRICTED_LISTS_STATE: RestrictedListsState = {
  blockedCountriesPerList: {
    [normalizeListSource(MOCK_ONDO_LIST_URL)]: ['US', 'CN'],
  },
  consentHashPerList: {
    [normalizeListSource(MOCK_ONDO_LIST_URL)]: 'test-consent-hash',
  },
  isLoaded: true,
}

describe('useFilterBlockedLists', () => {
  function createWrapper(restrictedListsState: RestrictedListsState) {
    const store = createStore()
    store.set(restrictedListsAtom, restrictedListsState)

    return ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
  }

  const allLists = [MOCK_ONDO_LIST, MOCK_COWSWAP_LIST]

  it('returns all lists when country is null', () => {
    const { result } = renderHook(() => useFilterBlockedLists(allLists, null), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).toHaveLength(2)
    expect(result.current).toContain(MOCK_ONDO_LIST)
    expect(result.current).toContain(MOCK_COWSWAP_LIST)
  })

  it('returns all lists when restricted lists are not loaded', () => {
    const notLoadedState: RestrictedListsState = {
      blockedCountriesPerList: {},
      consentHashPerList: {},
      isLoaded: false,
    }

    const { result } = renderHook(() => useFilterBlockedLists(allLists, 'US'), {
      wrapper: createWrapper(notLoadedState),
    })

    expect(result.current).toHaveLength(2)
  })

  it('filters out blocked lists for the country', () => {
    const { result } = renderHook(() => useFilterBlockedLists(allLists, 'US'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).toHaveLength(1)
    expect(result.current).not.toContain(MOCK_ONDO_LIST)
    expect(result.current).toContain(MOCK_COWSWAP_LIST)
  })

  it('returns all lists when country is not blocked', () => {
    const { result } = renderHook(() => useFilterBlockedLists(allLists, 'DE'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).toHaveLength(2)
  })

  it('handles lowercase country codes', () => {
    const { result } = renderHook(() => useFilterBlockedLists(allLists, 'us'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).toHaveLength(1)
    expect(result.current).not.toContain(MOCK_ONDO_LIST)
  })

  it('returns empty array when all lists are blocked', () => {
    const allBlockedState: RestrictedListsState = {
      blockedCountriesPerList: {
        [normalizeListSource(MOCK_ONDO_LIST_URL)]: ['US'],
        [normalizeListSource(MOCK_COWSWAP_LIST_URL)]: ['US'],
      },
      consentHashPerList: {},
      isLoaded: true,
    }

    const { result } = renderHook(() => useFilterBlockedLists(allLists, 'US'), {
      wrapper: createWrapper(allBlockedState),
    })

    expect(result.current).toHaveLength(0)
  })

  it('handles empty lists array', () => {
    const { result } = renderHook(() => useFilterBlockedLists([], 'US'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).toHaveLength(0)
  })
})
