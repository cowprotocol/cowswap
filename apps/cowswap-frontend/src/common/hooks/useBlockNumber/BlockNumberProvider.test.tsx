import { ReactNode } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'
import type { JsonRpcProvider } from '@ethersproject/providers'

import { render } from '@testing-library/react'

import { BlockNumberProvider } from './BlockNumberProvider'

jest.mock('@cowprotocol/common-const', () => ({
  getRpcProvider: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useIsWindowVisible: jest.fn(),
}))

jest.mock('@cowprotocol/wallet-provider', () => ({
  useWalletChainId: jest.fn(),
  useWalletProvider: jest.fn(),
}))

type MockRpcProvider = {
  getBlockNumber: jest.Mock<Promise<number>, []>
  on: jest.Mock<void, ['block', (block: number) => void]>
  removeListener: jest.Mock<void, ['block', (block: number) => void]>
}

type GetRpcProviderMock = (chainId: number) => JsonRpcProvider | null

function TestContent({ children }: { children: ReactNode }): ReactNode {
  return <BlockNumberProvider>{children}</BlockNumberProvider>
}

describe('BlockNumberProvider', () => {
  const mockGetRpcProvider = getRpcProvider as unknown as jest.MockedFunction<GetRpcProviderMock>
  const mockUseIsWindowVisible = useIsWindowVisible as jest.MockedFunction<typeof useIsWindowVisible>
  const mockUseWalletChainId = useWalletChainId as jest.MockedFunction<typeof useWalletChainId>
  const mockUseWalletProvider = useWalletProvider as jest.MockedFunction<typeof useWalletProvider>

  let provider: MockRpcProvider
  let walletProvider: MockRpcProvider

  beforeEach(() => {
    provider = {
      getBlockNumber: jest.fn().mockResolvedValue(123),
      on: jest.fn(),
      removeListener: jest.fn(),
    }

    walletProvider = {
      getBlockNumber: jest.fn().mockResolvedValue(456),
      on: jest.fn(),
      removeListener: jest.fn(),
    }

    mockUseWalletChainId.mockReturnValue(1)
    mockUseIsWindowVisible.mockReturnValue(true)
    mockUseWalletProvider.mockReturnValue(walletProvider as unknown as ReturnType<typeof useWalletProvider>)
    mockGetRpcProvider.mockReturnValue(provider as unknown as JsonRpcProvider)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('subscribes to the wallet provider and cleans up on unmount when connected', () => {
    const { unmount } = render(<div />, { wrapper: TestContent })

    expect(mockGetRpcProvider).toHaveBeenCalledWith(1)
    expect(walletProvider.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(walletProvider.on).toHaveBeenCalledWith('block', expect.any(Function))

    const blockHandler = walletProvider.on.mock.calls[0][1]

    unmount()

    expect(walletProvider.removeListener).toHaveBeenCalledWith('block', blockHandler)
    expect(provider.getBlockNumber).not.toHaveBeenCalled()
  })

  it('does not subscribe when the window is hidden', () => {
    mockUseIsWindowVisible.mockReturnValue(false)

    render(<div />, { wrapper: TestContent })

    expect(mockGetRpcProvider).toHaveBeenCalledWith(1)
    expect(provider.getBlockNumber).not.toHaveBeenCalled()
    expect(provider.on).not.toHaveBeenCalled()
  })

  it('falls back to the shared rpc provider when no wallet provider exists', () => {
    mockUseWalletProvider.mockReturnValue(undefined as ReturnType<typeof useWalletProvider>)

    const { unmount } = render(<div />, { wrapper: TestContent })

    expect(mockGetRpcProvider).toHaveBeenCalledWith(1)
    expect(provider.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(provider.on).toHaveBeenCalledWith('block', expect.any(Function))

    const blockHandler = provider.on.mock.calls[0][1]

    unmount()

    expect(provider.removeListener).toHaveBeenCalledWith('block', blockHandler)
    expect(walletProvider.getBlockNumber).not.toHaveBeenCalled()
  })

  it('falls back to the wallet provider when no shared rpc provider exists', () => {
    mockGetRpcProvider.mockReturnValue(null)

    const { unmount } = render(<div />, { wrapper: TestContent })

    expect(mockGetRpcProvider).toHaveBeenCalledWith(1)
    expect(walletProvider.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(walletProvider.on).toHaveBeenCalledWith('block', expect.any(Function))

    const blockHandler = walletProvider.on.mock.calls[0][1]

    unmount()

    expect(walletProvider.removeListener).toHaveBeenCalledWith('block', blockHandler)
    expect(provider.getBlockNumber).not.toHaveBeenCalled()
  })
})
