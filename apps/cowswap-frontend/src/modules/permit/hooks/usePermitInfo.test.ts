import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Token } from '@cowprotocol/currency'
import type { PermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'
import { TradeType } from 'common/modules/tradeNavigation'

import { usePermitInfo } from './usePermitInfo'
import { usePreGeneratedPermitInfoForToken } from './usePreGeneratedPermitInfoForToken'

jest.mock('@cowprotocol/common-utils', () => ({
  getIsNativeToken: jest.fn().mockReturnValue(false),
  getWrappedToken: jest.fn((token) => token),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('common/hooks/featureFlags/useIsPermitEnabled', () => ({
  useIsPermitEnabled: jest.fn(),
}))

jest.mock('common/modules/tradeNavigation', () => ({
  TradeType: {
    SWAP: 'SWAP',
    LIMIT_ORDER: 'LIMIT_ORDER',
    ADVANCED_ORDERS: 'ADVANCED_ORDERS',
    YIELD: 'YIELD',
  },
}))

jest.mock('./usePreGeneratedPermitInfoForToken', () => ({
  usePreGeneratedPermitInfoForToken: jest.fn(),
}))

const mockedGetIsNativeToken = getIsNativeToken as jest.MockedFunction<typeof getIsNativeToken>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseIsPermitEnabled = useIsPermitEnabled as jest.MockedFunction<typeof useIsPermitEnabled>
const mockedUsePreGeneratedPermitInfoForToken = usePreGeneratedPermitInfoForToken as jest.MockedFunction<
  typeof usePreGeneratedPermitInfoForToken
>

describe('usePermitInfo', () => {
  const token = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TEST', 'Test Token')
  const preGeneratedPermitInfo: PermitInfo = { type: 'eip-2612', name: 'Test Token', version: '1' }

  beforeEach(() => {
    jest.clearAllMocks()

    mockedGetIsNativeToken.mockReturnValue(false)
    mockedUseWalletInfo.mockReturnValue({ chainId: 1 } as ReturnType<typeof useWalletInfo>)
    mockedUseIsPermitEnabled.mockReturnValue(true)
    mockedUsePreGeneratedPermitInfoForToken.mockImplementation((tokenToCheck) => ({
      permitInfo: tokenToCheck ? preGeneratedPermitInfo : undefined,
      isLoading: false,
    }))
  })

  it('returns pre-generated permit info for the token', () => {
    const { result } = renderHook(() => usePermitInfo(token, TradeType.SWAP))

    expect(result.current).toEqual(preGeneratedPermitInfo)
  })

  it('treats tokens missing from the pre-generated list as unsupported', () => {
    mockedUsePreGeneratedPermitInfoForToken.mockReturnValue({ permitInfo: undefined, isLoading: false })

    const { result } = renderHook(() => usePermitInfo(token, TradeType.SWAP))

    expect(result.current).toEqual({ type: 'unsupported', name: 'Test Token' })
  })

  it('returns undefined while the pre-generated list is loading', () => {
    mockedUsePreGeneratedPermitInfoForToken.mockReturnValue({ permitInfo: undefined, isLoading: true })

    const { result } = renderHook(() => usePermitInfo(token, TradeType.SWAP))

    expect(result.current).toBeUndefined()
  })

  it('returns unsupported for native tokens', () => {
    mockedGetIsNativeToken.mockReturnValue(true)

    const { result } = renderHook(() => usePermitInfo(token, TradeType.SWAP))

    expect(result.current).toEqual({ type: 'unsupported', name: 'native' })
    expect(mockedUsePreGeneratedPermitInfoForToken).toHaveBeenCalledWith(undefined)
  })

  it('returns undefined when the trade type does not support permit', () => {
    const { result } = renderHook(() => usePermitInfo(token, TradeType.ADVANCED_ORDERS))

    expect(result.current).toBeUndefined()
    expect(mockedUsePreGeneratedPermitInfoForToken).toHaveBeenCalledWith(undefined)
  })

  it('returns undefined when permit is disabled', () => {
    mockedUseIsPermitEnabled.mockReturnValue(false)

    const { result } = renderHook(() => usePermitInfo(token, TradeType.SWAP))

    expect(result.current).toBeUndefined()
  })
})
