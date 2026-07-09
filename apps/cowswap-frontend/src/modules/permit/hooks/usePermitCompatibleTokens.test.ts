import { useAtomValue } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { PermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { usePermitCompatibleTokens } from './usePermitCompatibleTokens'
import { usePreGeneratedPermitInfo } from './usePreGeneratedPermitInfo'

import { getPermittableTokenKey } from '../state/permittableTokensAtom'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('common/hooks/featureFlags/useIsPermitEnabled', () => ({
  useIsPermitEnabled: jest.fn(),
}))

jest.mock('./usePreGeneratedPermitInfo', () => ({
  usePreGeneratedPermitInfo: jest.fn(),
}))

const mockedUseAtomValue = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseIsPermitEnabled = useIsPermitEnabled as jest.MockedFunction<typeof useIsPermitEnabled>
const mockedUsePreGeneratedPermitInfo = usePreGeneratedPermitInfo as jest.MockedFunction<
  typeof usePreGeneratedPermitInfo
>

describe('usePermitCompatibleTokens', () => {
  const chainId = 1
  const tokenAddress = '0x1234567890123456789012345678901234567890'
  const spender = '0x1111111111111111111111111111111111111111'
  const permitInfo: PermitInfo = { type: 'eip-2612', name: 'Test Token', version: '1' }

  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseWalletInfo.mockReturnValue({ chainId } as ReturnType<typeof useWalletInfo>)
    mockedUseIsPermitEnabled.mockReturnValue(true)
    mockedUsePreGeneratedPermitInfo.mockReturnValue({ allPermitInfo: {}, isLoading: false })
  })

  it('maps local token-spender permit info back to the token address', () => {
    const permitTokenKey = getPermittableTokenKey(tokenAddress, spender)

    mockedUseAtomValue.mockReturnValue({
      [chainId]: {
        [permitTokenKey]: permitInfo,
      },
    })

    const { result } = renderHook(() => usePermitCompatibleTokens())

    expect(result.current[getAddressKey(tokenAddress)]).toBe(true)
    expect(result.current[permitTokenKey]).toBeUndefined()
  })
})
