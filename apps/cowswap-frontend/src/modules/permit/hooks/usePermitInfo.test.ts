import { useAtomValue, useSetAtom } from 'jotai'

import { Token } from '@cowprotocol/currency'
import { getTokenPermitInfo } from '@cowprotocol/permit-utils'
import type { PermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook, waitFor } from '@testing-library/react'
import { useConfig, usePublicClient } from 'wagmi'

import { TradeType } from 'modules/trade'

import { useIsPermitEnabled } from 'common/hooks/featureFlags/useIsPermitEnabled'

import { usePermitInfo } from './usePermitInfo'
import { usePreGeneratedPermitInfoForToken } from './usePreGeneratedPermitInfoForToken'

import { getPermittableTokenKey } from '../state/permittableTokensAtom'

const defaultSpender = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const customSpender = '0x1111111111111111111111111111111111111111'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
  useSetAtom: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS: { 1: defaultSpender },
  getIsNativeToken: jest.fn().mockReturnValue(false),
  getWrappedToken: jest.fn((token) => token),
}))

jest.mock('@cowprotocol/permit-utils', () => ({
  DEFAULT_MIN_GAS_LIMIT: 50000n,
  getTokenPermitInfo: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('wagmi', () => ({
  useConfig: jest.fn(),
  usePublicClient: jest.fn(),
}))

jest.mock('common/hooks/featureFlags/useIsPermitEnabled', () => ({
  useIsPermitEnabled: jest.fn(),
}))

jest.mock('modules/trade', () => ({
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

const mockedUseAtomValue = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const mockedUseSetAtom = useSetAtom as jest.MockedFunction<typeof useSetAtom>
const mockedGetTokenPermitInfo = getTokenPermitInfo as jest.MockedFunction<typeof getTokenPermitInfo>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseConfig = useConfig as jest.MockedFunction<typeof useConfig>
const mockedUsePublicClient = usePublicClient as jest.MockedFunction<typeof usePublicClient>
const mockedUseIsPermitEnabled = useIsPermitEnabled as jest.MockedFunction<typeof useIsPermitEnabled>
const mockedUsePreGeneratedPermitInfoForToken = usePreGeneratedPermitInfoForToken as jest.MockedFunction<
  typeof usePreGeneratedPermitInfoForToken
>

describe('usePermitInfo', () => {
  const token = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TEST', 'Test Token')
  const addPermitInfo = jest.fn()
  const defaultPermitInfo: PermitInfo = { type: 'eip-2612', name: 'Test Token', version: '1' }
  const fetchedPermitInfo: PermitInfo = { type: 'unsupported', name: 'Test Token' }

  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseAtomValue.mockReturnValue({})
    mockedUseSetAtom.mockReturnValue(addPermitInfo)
    mockedUseWalletInfo.mockReturnValue({ chainId: 1 } as ReturnType<typeof useWalletInfo>)
    mockedUseConfig.mockReturnValue({} as ReturnType<typeof useConfig>)
    mockedUsePublicClient.mockReturnValue({} as ReturnType<typeof usePublicClient>)
    mockedUseIsPermitEnabled.mockReturnValue(true)
    mockedUsePreGeneratedPermitInfoForToken.mockImplementation(() => ({ permitInfo: undefined, isLoading: false }))
    mockedGetTokenPermitInfo.mockResolvedValue(fetchedPermitInfo)
  })

  it('does not reuse cached permit info that belongs to a different spender', async () => {
    mockedUseAtomValue.mockReturnValue({
      1: {
        [getPermittableTokenKey(token.address, defaultSpender)]: defaultPermitInfo,
      },
    })

    const { result } = renderHook(() => usePermitInfo(token, TradeType.SWAP, customSpender))

    expect(result.current).toBeUndefined()

    await waitFor(() => {
      expect(mockedGetTokenPermitInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          spender: customSpender,
          tokenAddress: token.address,
        }),
      )
    })
  })

  it('revalidates custom spenders instead of reusing pre-generated permit info', async () => {
    mockedUsePreGeneratedPermitInfoForToken.mockImplementation((tokenToCheck) => ({
      permitInfo: tokenToCheck ? defaultPermitInfo : undefined,
      isLoading: false,
    }))

    const { result } = renderHook(() => usePermitInfo(token, TradeType.SWAP, customSpender))

    expect(result.current).toBeUndefined()
    expect(mockedUsePreGeneratedPermitInfoForToken).toHaveBeenCalledWith(undefined)

    await waitFor(() => {
      expect(mockedGetTokenPermitInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          spender: customSpender,
          tokenAddress: token.address,
        }),
      )
    })

    await waitFor(() => {
      expect(addPermitInfo).toHaveBeenCalledWith({
        chainId: 1,
        tokenAddress: token.address,
        spender: customSpender,
        permitInfo: fetchedPermitInfo,
      })
    })
  })

  it('reuses pre-generated permit info for the default spender', () => {
    mockedUsePreGeneratedPermitInfoForToken.mockImplementation((tokenToCheck) => ({
      permitInfo: tokenToCheck ? defaultPermitInfo : undefined,
      isLoading: false,
    }))

    const { result } = renderHook(() => usePermitInfo(token, TradeType.SWAP))

    expect(result.current).toEqual(defaultPermitInfo)
    expect(mockedGetTokenPermitInfo).not.toHaveBeenCalled()
  })
})
