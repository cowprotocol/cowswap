import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowShedHooks } from '@cowprotocol/sdk-cow-shed'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { EOA_TWAP_SHED_FACTORY_OPTIONS } from 'modules/cowShed'

import { useAccountProxies } from './useAccountProxies'

jest.mock('@cowprotocol/sdk-cow-shed', () => ({
  ...jest.requireActual('@cowprotocol/sdk-cow-shed'),
  CowShedHooks: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
  useIsSafeWallet: jest.fn(),
}))

const ACCOUNT = '0x1111111111111111111111111111111111111111'
const CUSTOM_PROXY = '0x2222222222222222222222222222222222222222'
const CHAIN_ID = SupportedChainId.MAINNET
const useFeatureFlagsMock = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useIsSafeWalletMock = useIsSafeWallet as jest.MockedFunction<typeof useIsSafeWallet>
const CowShedHooksMock = CowShedHooks as jest.MockedClass<typeof CowShedHooks>
const proxyOfMock = jest.fn()

describe('useAccountProxies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useFeatureFlagsMock.mockReturnValue({ isTwapEoaEnabled: true })
    useIsSafeWalletMock.mockReturnValue(false)
    useWalletInfoMock.mockReturnValue({ account: ACCOUNT, chainId: CHAIN_ID } as ReturnType<typeof useWalletInfo>)
    proxyOfMock
      .mockReturnValueOnce('0x3333333333333333333333333333333333333333')
      .mockReturnValueOnce('0x4444444444444444444444444444444444444444')
      .mockReturnValueOnce(CUSTOM_PROXY)
    CowShedHooksMock.mockImplementation(() => ({ proxyOf: proxyOfMock }) as unknown as CowShedHooks)
  })

  it('includes the custom EOA TWAP proxy', () => {
    const { result } = renderHook(() => useAccountProxies())
    const eoaTwapProxy = result.current?.find(({ id }) => id === 'twap-account-proxy')

    expect(eoaTwapProxy?.label?.message).toBe('TWAP Account Proxy')
    expect(eoaTwapProxy?.factoryOptions).toBe(EOA_TWAP_SHED_FACTORY_OPTIONS)
    expect(eoaTwapProxy?.account).toBe(CUSTOM_PROXY)
    expect(CowShedHooksMock).toHaveBeenCalledWith(CHAIN_ID, EOA_TWAP_SHED_FACTORY_OPTIONS, undefined)
  })

  it('excludes the custom EOA TWAP proxy when the feature is disabled', () => {
    useFeatureFlagsMock.mockReturnValue({ isTwapEoaEnabled: false })

    const { result } = renderHook(() => useAccountProxies())

    expect(result.current?.some(({ id }) => id === 'twap-account-proxy')).toBe(false)
    expect(proxyOfMock).toHaveBeenCalledTimes(2)
  })

  it('excludes the custom EOA TWAP proxy for Safe wallets', () => {
    useIsSafeWalletMock.mockReturnValue(true)

    const { result } = renderHook(() => useAccountProxies())

    expect(result.current?.some(({ id }) => id === 'twap-account-proxy')).toBe(false)
    expect(proxyOfMock).toHaveBeenCalledTimes(2)
  })

  it('returns no proxies without a connected account', () => {
    useWalletInfoMock.mockReturnValue({ account: undefined, chainId: CHAIN_ID } as ReturnType<typeof useWalletInfo>)

    const { result } = renderHook(() => useAccountProxies())

    expect(result.current).toBeNull()
  })
})
