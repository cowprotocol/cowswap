import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { getRestrictedTokenLists } from '@cowprotocol/core'
import { getTokenId, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { render, waitFor } from '@testing-library/react'

import { RestrictedTokenListState, restrictedTokensAtom } from '../../state/restrictedTokens/restrictedTokensAtom'

import { RestrictedTokensListUpdater, RWA_CONSENT_HASH } from '.'

const mockSaveToCache = jest.fn()
let mockHasFreshCache = true

jest.mock('@cowprotocol/core', () => ({
  ...jest.requireActual('@cowprotocol/core'),
  getRestrictedTokenLists: jest.fn(),
}))

jest.mock('../../hooks/useRestrictedTokensCache', () => ({
  useRestrictedTokensCache: () => ({
    shouldFetch: true,
    hasFreshCache: mockHasFreshCache,
    saveToCache: mockSaveToCache,
  }),
}))

const mockGetRestrictedTokenLists = getRestrictedTokenLists as jest.MockedFunction<typeof getRestrictedTokenLists>

const RESTRICTED_LIST_URL = 'https://example.com/restricted-token-list.json'
const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111'
const TOKEN_ID = getTokenId({ chainId: SupportedChainId.MAINNET, address: TOKEN_ADDRESS })

const TOKEN_INFO: TokenInfo = {
  chainId: SupportedChainId.MAINNET,
  address: TOKEN_ADDRESS,
  name: 'Restricted token',
  symbol: 'RWA',
  decimals: 18,
}

const LOADED_RESTRICTED_TOKENS_STATE: RestrictedTokenListState = {
  tokensMap: {
    [TOKEN_ID]: TOKEN_INFO,
  },
  countriesPerToken: {
    [TOKEN_ID]: ['US'],
  },
  consentHashPerToken: {
    [TOKEN_ID]: RWA_CONSENT_HASH,
  },
  isLoaded: true,
}

describe('RestrictedTokensListUpdater', () => {
  const originalFetch = global.fetch
  const originalConsoleError = console.error

  beforeEach(() => {
    jest.clearAllMocks()
    mockSaveToCache.mockClear()
    mockHasFreshCache = true
    console.error = jest.fn()
    mockGetRestrictedTokenLists.mockResolvedValue([
      {
        name: 'Restricted list',
        tokenListUrl: RESTRICTED_LIST_URL,
        restrictedCountries: ['US'],
      },
    ])
  })

  afterEach(() => {
    global.fetch = originalFetch
    console.error = originalConsoleError
  })

  it('preserves the previous restricted token state when a refresh list fetch fails', async () => {
    const store = createStore()
    store.set(restrictedTokensAtom, LOADED_RESTRICTED_TOKENS_STATE)

    global.fetch = jest.fn(() => Promise.reject(new Error('list unavailable'))) as typeof fetch

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

    render(<RestrictedTokensListUpdater isRwaGeoblockEnabled={true} />, { wrapper })

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to fetch token list for Restricted list:', expect.any(Error))
    })

    expect(store.get(restrictedTokensAtom)).toEqual(LOADED_RESTRICTED_TOKENS_STATE)
  })

  it('fails closed when a stale restricted token refresh fails', async () => {
    mockHasFreshCache = false
    const store = createStore()
    store.set(restrictedTokensAtom, LOADED_RESTRICTED_TOKENS_STATE)

    global.fetch = jest.fn(() => Promise.reject(new Error('list unavailable'))) as typeof fetch

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

    render(<RestrictedTokensListUpdater isRwaGeoblockEnabled={true} />, { wrapper })

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to fetch token list for Restricted list:', expect.any(Error))
    })

    expect(store.get(restrictedTokensAtom).isLoaded).toBe(false)
  })
})
