import { createStore } from 'jotai'
import { Provider } from 'jotai'
import { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'

import { normalizeListSource } from './useIsListBlocked'
import { useRestrictedListInfo } from './useRestrictedListInfo'

import { restrictedListsAtom, RestrictedListsState } from '../../state/restrictedTokens/restrictedTokensAtom'

const MOCK_ONDO_LIST_URL =
  'https://raw.githubusercontent.com/ondoprotocol/cowswap-global-markets-token-list/main/tokenlist.json'
const MOCK_CONSENT_HASH = 'bafkreidcn4bhj44nnethx6clfspkapahshqyq44adz674y7je5wyfiazsq'

const MOCK_RESTRICTED_LISTS_STATE: RestrictedListsState = {
  blockedCountriesPerList: {
    [normalizeListSource(MOCK_ONDO_LIST_URL)]: ['US', 'CN'],
  },
  consentHashPerList: {
    [normalizeListSource(MOCK_ONDO_LIST_URL)]: MOCK_CONSENT_HASH,
  },
  isLoaded: true,
}

describe('useRestrictedListInfo', () => {
  function createWrapper(restrictedListsState: RestrictedListsState) {
    const store = createStore()
    store.set(restrictedListsAtom, restrictedListsState)

    return ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
  }

  it('returns null when listSource is undefined', () => {
    const { result } = renderHook(() => useRestrictedListInfo(undefined), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).toBeNull()
  })

  it('returns null when restricted lists are not loaded', () => {
    const notLoadedState: RestrictedListsState = {
      blockedCountriesPerList: {},
      consentHashPerList: {},
      isLoaded: false,
    }

    const { result } = renderHook(() => useRestrictedListInfo(MOCK_ONDO_LIST_URL), {
      wrapper: createWrapper(notLoadedState),
    })

    expect(result.current).toBeNull()
  })

  it('returns null when list is not in restricted lists', () => {
    const { result } = renderHook(() => useRestrictedListInfo('https://unknown-list.com/tokens.json'), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).toBeNull()
  })

  it('returns restricted list info for a restricted list', () => {
    const { result } = renderHook(() => useRestrictedListInfo(MOCK_ONDO_LIST_URL), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).not.toBeNull()
    expect(result.current?.source).toBe(normalizeListSource(MOCK_ONDO_LIST_URL))
    expect(result.current?.blockedCountries).toEqual(['US', 'CN'])
    expect(result.current?.consentHash).toBe(MOCK_CONSENT_HASH)
  })

  it('handles URL case insensitivity', () => {
    const upperCaseUrl = MOCK_ONDO_LIST_URL.toUpperCase()

    const { result } = renderHook(() => useRestrictedListInfo(upperCaseUrl), {
      wrapper: createWrapper(MOCK_RESTRICTED_LISTS_STATE),
    })

    expect(result.current).not.toBeNull()
    expect(result.current?.blockedCountries).toEqual(['US', 'CN'])
  })

  it('returns null when blockedCountries is missing', () => {
    const incompleteState: RestrictedListsState = {
      blockedCountriesPerList: {},
      consentHashPerList: {
        [normalizeListSource(MOCK_ONDO_LIST_URL)]: MOCK_CONSENT_HASH,
      },
      isLoaded: true,
    }

    const { result } = renderHook(() => useRestrictedListInfo(MOCK_ONDO_LIST_URL), {
      wrapper: createWrapper(incompleteState),
    })

    expect(result.current).toBeNull()
  })

  it('returns null when consentHash is missing', () => {
    const incompleteState: RestrictedListsState = {
      blockedCountriesPerList: {
        [normalizeListSource(MOCK_ONDO_LIST_URL)]: ['US'],
      },
      consentHashPerList: {},
      isLoaded: true,
    }

    const { result } = renderHook(() => useRestrictedListInfo(MOCK_ONDO_LIST_URL), {
      wrapper: createWrapper(incompleteState),
    })

    expect(result.current).toBeNull()
  })
})
