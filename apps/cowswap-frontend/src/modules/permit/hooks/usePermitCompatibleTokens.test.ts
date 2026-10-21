import { getAddressKey } from '@cowprotocol/cow-sdk'
import { PermitInfo } from '@cowprotocol/permit-utils'

import { renderHook } from '@testing-library/react'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { usePermitCompatibleTokens } from './usePermitCompatibleTokens'
import { usePreGeneratedPermitInfo } from './usePreGeneratedPermitInfo'

jest.mock('common/hooks/featureFlags/useIsPermitEnabled', () => ({
  useIsPermitEnabled: jest.fn(),
}))

jest.mock('./usePreGeneratedPermitInfo', () => ({
  usePreGeneratedPermitInfo: jest.fn(),
}))

const mockedUseIsPermitEnabled = useIsPermitEnabled as jest.MockedFunction<typeof useIsPermitEnabled>
const mockedUsePreGeneratedPermitInfo = usePreGeneratedPermitInfo as jest.MockedFunction<
  typeof usePreGeneratedPermitInfo
>

describe('usePermitCompatibleTokens', () => {
  const permittableToken = '0x1234567890123456789012345678901234567890'
  const unsupportedToken = '0x2222222222222222222222222222222222222222'
  const permitInfo: PermitInfo = { type: 'eip-2612', name: 'Test Token', version: '1' }

  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseIsPermitEnabled.mockReturnValue(true)
    mockedUsePreGeneratedPermitInfo.mockReturnValue({
      allPermitInfo: {
        [permittableToken]: permitInfo,
        [unsupportedToken]: { type: 'unsupported', name: 'Other' },
      },
      isLoading: false,
    })
  })

  it('maps pre-generated permit info to permit compatibility', () => {
    const { result } = renderHook(() => usePermitCompatibleTokens())

    expect(result.current).toEqual({
      [getAddressKey(permittableToken)]: true,
      [getAddressKey(unsupportedToken)]: false,
    })
  })

  it('returns no compatible tokens when permit is disabled', () => {
    mockedUseIsPermitEnabled.mockReturnValue(false)

    const { result } = renderHook(() => usePermitCompatibleTokens())

    expect(result.current).toEqual({})
  })
})
