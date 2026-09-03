import { useConfig, useWalletClient } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { CowShedHooks } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useRecoverFundsFromProxy } from './useRecoverFundsFromProxy'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('wagmi', () => ({
  useWalletClient: jest.fn(),
  useConfig: jest.fn(),
}))

const ACCOUNT = '0x1111111111111111111111111111111111111111'
const PROXY = '0x2222222222222222222222222222222222222222'
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useWalletClientMock = useWalletClient as jest.MockedFunction<typeof useWalletClient>
const useConfigMock = useConfig as jest.MockedFunction<typeof useConfig>

describe('useRecoverFundsFromProxy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useWalletInfoMock.mockReturnValue({
      account: ACCOUNT,
      chainId: SupportedChainId.MAINNET,
    } as ReturnType<typeof useWalletInfo>)
    useWalletClientMock.mockReturnValue({ data: undefined } as ReturnType<typeof useWalletClient>)
    useConfigMock.mockReturnValue({} as ReturnType<typeof useConfig>)
  })

  it('uses the selected proxy SDK', () => {
    const proxyOf = jest.fn(() => PROXY)
    const cowShedHooks = {
      proxyOf,
      getFactoryAddress: jest.fn(() => '0x3333333333333333333333333333333333333333'),
    } as unknown as CowShedHooks

    const { result } = renderHook(() =>
      useRecoverFundsFromProxy({
        cowShedHooks,
        selectedTokenAddress: undefined,
        tokenBalance: null,
        isNativeToken: false,
      }),
    )

    expect(proxyOf).toHaveBeenCalledWith(ACCOUNT)
    expect(result.current.proxyAddress).toBe(PROXY)
  })

  it('does not call proxyOf for a non-EVM chain', () => {
    useWalletInfoMock.mockReturnValue({
      account: ACCOUNT,
      chainId: SupportedChainId.SOLANA,
    } as ReturnType<typeof useWalletInfo>)
    const proxyOf = jest.fn(() => PROXY)
    const cowShedHooks = {
      proxyOf,
      getFactoryAddress: jest.fn(() => '0x3333333333333333333333333333333333333333'),
    } as unknown as CowShedHooks

    const { result } = renderHook(() =>
      useRecoverFundsFromProxy({
        cowShedHooks,
        selectedTokenAddress: undefined,
        tokenBalance: null,
        isNativeToken: false,
      }),
    )

    expect(proxyOf).not.toHaveBeenCalled()
    expect(result.current.proxyAddress).toBeUndefined()
  })
})
