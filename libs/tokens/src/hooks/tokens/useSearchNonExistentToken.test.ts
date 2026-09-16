import { TokenWithLogo } from '@cowprotocol/common-const'

import { renderHook } from '@testing-library/react'

import { useSearchNonExistentToken } from './useSearchNonExistentToken'
import { useSearchToken } from './useSearchToken'
import { useTokenBySymbolOrAddress } from './useTokenBySymbolOrAddress'
import { useTokensByAddressMap } from './useTokensByAddressMap'

jest.mock('./useSearchToken', () => ({ useSearchToken: jest.fn() }))
jest.mock('./useTokenBySymbolOrAddress', () => ({ useTokenBySymbolOrAddress: jest.fn() }))
jest.mock('./useTokensByAddressMap', () => ({ useTokensByAddressMap: jest.fn() }))

const mockedUseSearchToken = useSearchToken as jest.MockedFunction<typeof useSearchToken>
const mockedUseTokenBySymbolOrAddress = useTokenBySymbolOrAddress as jest.MockedFunction<
  typeof useTokenBySymbolOrAddress
>
const mockedUseTokensByAddressMap = useTokensByAddressMap as jest.MockedFunction<typeof useTokensByAddressMap>

// Real Base addresses: the Coinbase RWA list ships AAPL here, CoinGecko ships the same address as AAPLC
const AAPL_ADDRESS = '0xb200000000000000000000C2e324d24d7eEcd1fb'

const AAPL_FROM_INACTIVE_LIST = new TokenWithLogo(undefined, 8453, AAPL_ADDRESS, 18, 'AAPL', 'Apple')
const AAPLC_ACTIVE = new TokenWithLogo(undefined, 8453, AAPL_ADDRESS.toLowerCase(), 18, 'AAPLC', 'Apple')

function mockSearchResult(inactiveListsResult: TokenWithLogo[]): void {
  mockedUseSearchToken.mockReturnValue({
    isLoading: false,
    activeListsResult: [],
    inactiveListsResult,
    externalApiResult: [],
    blockchainResult: [],
  })
}

describe('useSearchNonExistentToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // the symbol does not resolve among active tokens, which is what triggers the search
    mockedUseTokenBySymbolOrAddress.mockReturnValue(null)
  })

  // Regression: AAPL only exists in an inactive list, but its address is already active as AAPLC.
  // Returning it here made the import prompt reopen every time the user-added copy was pruned.
  it('returns null when the found token address is already active under another symbol', () => {
    mockSearchResult([AAPL_FROM_INACTIVE_LIST])
    mockedUseTokensByAddressMap.mockReturnValue({ [AAPL_ADDRESS.toLowerCase()]: AAPLC_ACTIVE })

    const { result } = renderHook(() => useSearchNonExistentToken('AAPL'))

    expect(result.current).toBeNull()
  })

  it('still returns a token whose address is not active yet', () => {
    mockSearchResult([AAPL_FROM_INACTIVE_LIST])
    mockedUseTokensByAddressMap.mockReturnValue({})

    const { result } = renderHook(() => useSearchNonExistentToken('AAPL'))

    expect(result.current).toBe(AAPL_FROM_INACTIVE_LIST)
  })
})
