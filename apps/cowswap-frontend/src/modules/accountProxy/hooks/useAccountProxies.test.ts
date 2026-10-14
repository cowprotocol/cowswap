import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  COW_SHED_1_0_0_VERSION,
  COW_SHED_1_0_1_VERSION,
  COW_SHED_2_1_0_VERSION,
  COW_SHED_FACTORY_FOR_COMPOSABLE_COW,
  CowShedHooks,
} from '@cowprotocol/sdk-cow-shed'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useAccountProxies } from './useAccountProxies'
import { useDeployedCowShedAddresses } from './useDeployedCowShedAddresses'

import { ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG } from '../accountProxy.constants'

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

jest.mock('./useDeployedCowShedAddresses', () => ({
  useDeployedCowShedAddresses: jest.fn(),
}))

const ACCOUNT = '0x1111111111111111111111111111111111111111'
const ADVANCED_ORDERS_PROXY = '0x2222222222222222222222222222222222222222'
const REGULAR_PROXY = '0x3333333333333333333333333333333333333333'
const VERSION_101_PROXY = '0x4444444444444444444444444444444444444444'
const VERSION_100_PROXY = '0x5555555555555555555555555555555555555555'
const CHAIN_ID = SupportedChainId.MAINNET
const useFeatureFlagsMock = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useIsSafeWalletMock = useIsSafeWallet as jest.MockedFunction<typeof useIsSafeWallet>
const useDeployedCowShedAddressesMock = useDeployedCowShedAddresses as jest.MockedFunction<
  typeof useDeployedCowShedAddresses
>
const CowShedHooksMock = CowShedHooks as jest.MockedClass<typeof CowShedHooks>
const proxyOfMock = jest.fn()

const ALL_DEPLOYED = [ADVANCED_ORDERS_PROXY, REGULAR_PROXY, VERSION_101_PROXY, VERSION_100_PROXY]

describe('useAccountProxies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useFeatureFlagsMock.mockReturnValue({ isTwapEoaEnabled: true })
    useIsSafeWalletMock.mockReturnValue(false)
    useWalletInfoMock.mockReturnValue({ account: ACCOUNT, chainId: CHAIN_ID } as ReturnType<typeof useWalletInfo>)
    useDeployedCowShedAddressesMock.mockReturnValue(ALL_DEPLOYED)
    proxyOfMock
      .mockReturnValueOnce(ADVANCED_ORDERS_PROXY)
      .mockReturnValueOnce(REGULAR_PROXY)
      .mockReturnValueOnce(VERSION_101_PROXY)
      .mockReturnValueOnce(VERSION_100_PROXY)
    CowShedHooksMock.mockImplementation(() => ({ proxyOf: proxyOfMock }) as unknown as CowShedHooks)
  })

  it('lists every configured proxy, including both 2.1.0 sheds', () => {
    const { result } = renderHook(() => useAccountProxies())
    const advancedOrdersProxy = result.current?.find(({ id }) => id === ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.id)

    expect(result.current?.map(({ id, version }) => ({ id, version }))).toEqual([
      { id: ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.id, version: COW_SHED_2_1_0_VERSION },
      { id: 'version-2.1.0', version: COW_SHED_2_1_0_VERSION },
      { id: 'version-1.0.1', version: COW_SHED_1_0_1_VERSION },
      { id: 'version-1.0.0', version: COW_SHED_1_0_0_VERSION },
    ])
    expect(advancedOrdersProxy?.label).toBe(ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.label)
    expect(advancedOrdersProxy?.factoryOptions?.factoryAddress).toBe(
      COW_SHED_FACTORY_FOR_COMPOSABLE_COW[COW_SHED_2_1_0_VERSION],
    )
    expect(advancedOrdersProxy?.account).toBe(ADVANCED_ORDERS_PROXY)
    expect(result.current?.find(({ id }) => id === 'version-2.1.0')?.label).toBeUndefined()
    expect(CowShedHooksMock).toHaveBeenNthCalledWith(
      1,
      CHAIN_ID,
      ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.factoryOptions,
      COW_SHED_2_1_0_VERSION,
    )
    expect(CowShedHooksMock).toHaveBeenNthCalledWith(2, CHAIN_ID, undefined, COW_SHED_2_1_0_VERSION)
  })

  it('lists older sheds while the deployment filter is off, without querying the indexer', () => {
    useDeployedCowShedAddressesMock.mockReturnValue([REGULAR_PROXY.toLowerCase()])

    const { result } = renderHook(() => useAccountProxies())

    expect(result.current?.map(({ id }) => id)).toEqual([
      ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.id,
      'version-2.1.0',
      'version-1.0.1',
      'version-1.0.0',
    ])
    expect(useDeployedCowShedAddressesMock).toHaveBeenCalledWith(undefined, undefined)
  })

  it('excludes the advanced orders proxy when the feature is disabled', () => {
    useFeatureFlagsMock.mockReturnValue({ isTwapEoaEnabled: false })

    const { result } = renderHook(() => useAccountProxies())

    expect(result.current?.some(({ id }) => id === ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.id)).toBe(false)
    expect(proxyOfMock).toHaveBeenCalledTimes(3)
  })

  it('excludes the advanced orders proxy for Safe wallets', () => {
    useIsSafeWalletMock.mockReturnValue(true)

    const { result } = renderHook(() => useAccountProxies())

    expect(result.current?.some(({ id }) => id === ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.id)).toBe(false)
    expect(proxyOfMock).toHaveBeenCalledTimes(3)
  })

  it('returns no proxies without a connected account', () => {
    useWalletInfoMock.mockReturnValue({ account: undefined, chainId: CHAIN_ID } as ReturnType<typeof useWalletInfo>)

    const { result } = renderHook(() => useAccountProxies())

    expect(result.current).toBeNull()
  })

  it('returns no proxies for a non-EVM chain, without calling proxyOf', () => {
    useWalletInfoMock.mockReturnValue({
      account: ACCOUNT,
      chainId: SupportedChainId.SOLANA,
    } as ReturnType<typeof useWalletInfo>)

    const { result } = renderHook(() => useAccountProxies())

    expect(result.current).toBeNull()
    expect(proxyOfMock).not.toHaveBeenCalled()
  })
})
