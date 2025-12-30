import { createStore } from 'jotai'
import { Provider } from 'jotai'
import { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'

import { getSourceAsKey, useIsListBlocked } from './useIsListBlocked'

import { restrictedListsAtom, RestrictedListsState } from '../../state/restrictedTokens/restrictedTokensAtom'

const MOCK_ONDO_LIST_URL =
  'https://raw.githubusercontent.com/ondoprotocol/cowswap-global-markets-token-list/main/tokenlist.json'

const MOCK_RESTRICTED_LISTS_STATE: RestrictedListsState = {
  blockedCountriesPerList: {
    [getSourceAsKey(MOCK_ONDO_LIST_URL)]: ['US', 'CN'],
  },
  consentHashPerList: {
    [getSourceAsKey(MOCK_ONDO_LIST_URL)]: 'bafkreidcn4bhj44nnethx6clfspkapahshqyq44adz674y7je5wyfiazsq',
  },
  isLoaded: true,
}

describe('getSourceAsKey', () => {
  it('converts to lowercase', () => {
    expect(getSourceAsKey('HTTPS://EXAMPLE.COM/list.json')).toBe('https://example.com/list.json')
  })

  it('trims whitespace', () => {
    expect(getSourceAsKey('  https://example.com/list.json  ')).toBe('https://example.com/list.json')
  })

  it('handles mixed case and whitespace', () => {
    expect(getSourceAsKey('  HTTPS://Example.COM/List.JSON  ')).toBe('https://example.com/list.json')
  })
})

describe('useIsListBlocked', () => {
  function createWrapper(restrictedListsState: RestrictedListsState) {
    const store = createStore()
    store.set(restrictedListsAtom, restrictedListsState)

    return ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
  }

  it('returns isLoading: true when restricted lists are not loaded', () => {
    const notLoadedState: RestrictedListsState = {
      blockedCountriesPerList: {},
      consentHashPerList: {},
      isLoaded: false,
    }

    const { result } = renderHook(() => useIsListBlocked(MOCK_ONDO_LIST_URL, 'US'), {
      wrapper: createWrapper(notLoadedState),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isBlocked).toBe(false)
  })

  it('returns isBlocked: false when listSource is undefined', () => {
    const { result } = renderHook(() => useIsListBlocked(undefined, 'US'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current.isBlocked).toBe(false)
    expect(result.current.isLoading).toBe(false) // returns early when listSource is undefined
  })

  it('returns isBlocked: false when country is null', () => {
    const { result } = renderHook(() => useIsListBlocked(MOCK_ONDO_LIST_URL, null), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current.isBlocked).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns isBlocked: true when country is in blocked list', () => {
    const { result } = renderHook(() => useIsListBlocked(MOCK_ONDO_LIST_URL, 'US'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current.isBlocked).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns isBlocked: true for lowercase country code', () => {
    const { result } = renderHook(() => useIsListBlocked(MOCK_ONDO_LIST_URL, 'us'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current.isBlocked).toBe(true)
  })

  it('returns isBlocked: false when country is not in blocked list', () => {
    const { result } = renderHook(() => useIsListBlocked(MOCK_ONDO_LIST_URL, 'DE'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current.isBlocked).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns isBlocked: false when list is not in restricted lists', () => {
    const { result } = renderHook(() => useIsListBlocked('https://unknown-list.com/tokens.json', 'US'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current.isBlocked).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('handles URL case insensitivity', () => {
    const upperCaseUrl = MOCK_ONDO_LIST_URL.toUpperCase()

    const { result } = renderHook(() => useIsListBlocked(upperCaseUrl, 'US'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current.isBlocked).toBe(true)
  })
})
