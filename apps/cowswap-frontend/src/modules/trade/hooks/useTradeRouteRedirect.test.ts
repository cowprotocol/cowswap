import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useLocation } from 'react-router'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { useTradeRouteRedirect } from './useTradeRouteRedirect'

jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('react-router', () => ({ useLocation: jest.fn() }))
jest.mock('common/hooks/useNavigate', () => ({ useNavigate: jest.fn() }))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>
const navigate = jest.fn()

describe('useTradeRouteRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ chainId: 1 } as ReturnType<typeof useWalletInfo>)
    mockUseLocation.mockReturnValue({ search: '' } as ReturnType<typeof useLocation>)
    mockUseNavigate.mockReturnValue(navigate)
  })

  it('uses route-specific default currencies before generic trade defaults', () => {
    renderHook(() =>
      useTradeRouteRedirect(Routes.RWA, {
        defaultInputCurrencyId: 'USDC',
        defaultOutputCurrencyId: 'AAPLON',
      }),
    )

    expect(navigate).toHaveBeenCalledWith({ pathname: '/1/rwa/USDC/AAPLON', search: '' }, { replace: true })
  })

  it('preserves an explicit route chain instead of replacing it with the wallet chain', () => {
    mockUseWalletInfo.mockReturnValue({ chainId: 100 } as ReturnType<typeof useWalletInfo>)

    renderHook(() =>
      useTradeRouteRedirect(Routes.RWA, {
        chainId: 1,
        defaultInputCurrencyId: 'USDC',
        defaultOutputCurrencyId: 'AAPLON',
      }),
    )

    expect(navigate).toHaveBeenCalledWith({ pathname: '/1/rwa/USDC/AAPLON', search: '' }, { replace: true })
  })

  it('preserves a currency supplied in a partial route', () => {
    renderHook(() =>
      useTradeRouteRedirect(Routes.RWA, {
        inputCurrencyId: 'DAI',
        defaultInputCurrencyId: 'USDC',
        defaultOutputCurrencyId: 'AAPLON',
      }),
    )

    expect(navigate).toHaveBeenCalledWith({ pathname: '/1/rwa/DAI/AAPLON', search: '' }, { replace: true })
  })
})
