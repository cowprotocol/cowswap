import { ReactNode } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

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
}))

type MockRpcProvider = {
  getBlockNumber: jest.Mock<Promise<number>, []>
  on: jest.Mock<void, ['block', (block: number) => void]>
  removeListener: jest.Mock<void, ['block', (block: number) => void]>
}

function TestContent({ children }: { children: ReactNode }): ReactNode {
  return <BlockNumberProvider>{children}</BlockNumberProvider>
}

describe('BlockNumberProvider', () => {
  const mockGetRpcProvider = getRpcProvider as jest.MockedFunction<typeof getRpcProvider>
  const mockUseIsWindowVisible = useIsWindowVisible as jest.MockedFunction<typeof useIsWindowVisible>
  const mockUseWalletChainId = useWalletChainId as jest.MockedFunction<typeof useWalletChainId>

  let provider: MockRpcProvider

  beforeEach(() => {
    provider = {
      getBlockNumber: jest.fn().mockResolvedValue(123),
      on: jest.fn(),
      removeListener: jest.fn(),
    }

    mockUseWalletChainId.mockReturnValue(1)
    mockUseIsWindowVisible.mockReturnValue(true)
    mockGetRpcProvider.mockReturnValue(provider as unknown as ReturnType<typeof getRpcProvider>)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('subscribes to the chain rpc provider and cleans up on unmount', () => {
    const { unmount } = render(<div />, { wrapper: TestContent })

    expect(mockGetRpcProvider).toHaveBeenCalledWith(1)
    expect(provider.getBlockNumber).toHaveBeenCalledTimes(1)
    expect(provider.on).toHaveBeenCalledWith('block', expect.any(Function))

    const blockHandler = provider.on.mock.calls[0][1]

    unmount()

    expect(provider.removeListener).toHaveBeenCalledWith('block', blockHandler)
  })

  it('does not subscribe when the window is hidden', () => {
    mockUseIsWindowVisible.mockReturnValue(false)

    render(<div />, { wrapper: TestContent })

    expect(mockGetRpcProvider).toHaveBeenCalledWith(1)
    expect(provider.getBlockNumber).not.toHaveBeenCalled()
    expect(provider.on).not.toHaveBeenCalled()
  })
})
