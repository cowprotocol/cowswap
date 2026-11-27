import { useAtomValue } from 'jotai'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
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
  const spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]
  const customSpender = '0x2222222222222222222222222222222222222222'
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

  it('ignores custom-spender results when mapping default permit compatibility', () => {
    mockedUsePreGeneratedPermitInfo.mockReturnValue({
      allPermitInfo: { [getAddressKey(tokenAddress)]: permitInfo },
      isLoading: false,
    })
    mockedUseAtomValue.mockReturnValue({
      [chainId]: {
        [getPermittableTokenKey(tokenAddress, customSpender)]: { type: 'unsupported' },
      },
    })

    const { result } = renderHook(() => usePermitCompatibleTokens())

    expect(result.current[getAddressKey(tokenAddress)]).toBe(true)
  })

  it('allows the default-spender result to override pre-generated compatibility', () => {
    mockedUsePreGeneratedPermitInfo.mockReturnValue({
      allPermitInfo: { [getAddressKey(tokenAddress)]: permitInfo },
      isLoading: false,
    })
    mockedUseAtomValue.mockReturnValue({
      [chainId]: {
        [getPermittableTokenKey(tokenAddress, spender)]: { type: 'unsupported' },
      },
    })

    const { result } = renderHook(() => usePermitCompatibleTokens())

    expect(result.current[getAddressKey(tokenAddress)]).toBe(false)
  })

  it('does not advertise permit compatibility from a custom-spender result alone', () => {
    mockedUseAtomValue.mockReturnValue({
      [chainId]: {
        [getPermittableTokenKey(tokenAddress, customSpender)]: permitInfo,
      },
    })

    const { result } = renderHook(() => usePermitCompatibleTokens())

    expect(result.current[getAddressKey(tokenAddress)]).toBeUndefined()
  })
})
