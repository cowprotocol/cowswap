import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useNavigate } from 'common/hooks/useNavigate'

import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

import { getDefaultTradeCurrenciesIds, useTradeNavigate, useTradeTypeInfoFromUrl } from '../modules/tradeNavigation'

jest.mock('common/hooks/useNavigate', () => ({
  useNavigate: jest.fn(),
}))

jest.mock('../modules/tradeNavigation', () => ({
  useTradeNavigate: jest.fn(),
  useTradeTypeInfoFromUrl: jest.fn(),
  getDefaultTradeCurrenciesIds: jest.fn(),
}))

const mockedUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>
const mockedUseTradeNavigate = useTradeNavigate as jest.MockedFunction<typeof useTradeNavigate>
const mockedUseTradeTypeInfoFromUrl = useTradeTypeInfoFromUrl as jest.MockedFunction<typeof useTradeTypeInfoFromUrl>
const mockedGetDefaultTradeCurrenciesIds = getDefaultTradeCurrenciesIds as jest.MockedFunction<
  typeof getDefaultTradeCurrenciesIds
>

const defaultCurrenciesIds = { inputCurrencyId: 'ETH_ID', outputCurrencyId: 'USDC_ID' }

function setUrl(hash: string): void {
  window.location.hash = hash
}

describe('useLegacySetChainIdToUrl', () => {
  let navigate: jest.Mock
  let tradeNavigate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    navigate = jest.fn()
    tradeNavigate = jest.fn()

    mockedUseNavigate.mockReturnValue(navigate)
    mockedUseTradeNavigate.mockReturnValue(tradeNavigate)
    mockedUseTradeTypeInfoFromUrl.mockReturnValue(null)
    mockedGetDefaultTradeCurrenciesIds.mockReturnValue(defaultCurrenciesIds)
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('does nothing when the target chain already matches the URL', () => {
    setUrl('#/1/some-page')
    const { result } = renderHook(() => useLegacySetChainIdToUrl())

    result.current(SupportedChainId.MAINNET)

    expect(navigate).not.toHaveBeenCalled()
    expect(tradeNavigate).not.toHaveBeenCalled()
  })

  it('delegates to tradeNavigate with default currencies when on a trade page', () => {
    mockedUseTradeTypeInfoFromUrl.mockReturnValue({ tradeType: 'swap', route: '/swap' } as never)
    setUrl('#/1/swap')

    const { result } = renderHook(() => useLegacySetChainIdToUrl())
    result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(getDefaultTradeCurrenciesIds).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)
    expect(tradeNavigate).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN, defaultCurrenciesIds)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('replaces the chain segment in a path-based URL', () => {
    setUrl('#/1/some-page?foo=bar')
    const { result } = renderHook(() => useLegacySetChainIdToUrl())

    result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(navigate).toHaveBeenCalledWith(
      { pathname: `/${SupportedChainId.GNOSIS_CHAIN}/some-page`, search: 'foo=bar' },
      { replace: true },
    )
    expect(tradeNavigate).not.toHaveBeenCalled()
  })

  it('does nothing on the root path, leaving chain resolution to the page redirect', () => {
    setUrl('#/')
    const { result } = renderHook(() => useLegacySetChainIdToUrl())

    result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(navigate).not.toHaveBeenCalled()
  })

  it.each(['/swap', '/limit', '/advanced', '/yield'])('does nothing on the chainless trade route %s', (route) => {
    setUrl(`#${route}`)
    const { result } = renderHook(() => useLegacySetChainIdToUrl())

    result.current(SupportedChainId.GNOSIS_CHAIN)

    expect(navigate).not.toHaveBeenCalled()
  })

  it('sets the legacy ?chain= query param on a non-trade, non-path-based route', () => {
    setUrl('#/some-static-page?foo=bar')
    const { result } = renderHook(() => useLegacySetChainIdToUrl())

    result.current(SupportedChainId.GNOSIS_CHAIN)

    const chainInfo = getChainInfo(SupportedChainId.GNOSIS_CHAIN)
    expect(navigate).toHaveBeenCalledWith(
      {
        pathname: '/some-static-page',
        search: `foo=bar&chain=${chainInfo.name}`,
      },
      { replace: true },
    )
  })

  it('does nothing when the target chain has no known chain info', () => {
    setUrl('#/some-static-page')
    const { result } = renderHook(() => useLegacySetChainIdToUrl())

    result.current(999999 as SupportedChainId)

    expect(navigate).not.toHaveBeenCalled()
  })
})
