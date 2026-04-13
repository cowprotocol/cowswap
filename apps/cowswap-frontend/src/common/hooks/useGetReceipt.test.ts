import { getRpcProvider } from '@cowprotocol/common-const'
import { RetryableError, retry } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

import { renderHook } from '@testing-library/react'

import { useGetReceipt } from './useGetReceipt'

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  getRpcProvider: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  retry: jest.fn((fn: () => Promise<TransactionReceipt>) => ({
    promise: fn(),
    cancel: jest.fn(),
  })),
}))

jest.mock('@cowprotocol/wallet-provider', () => ({
  ...jest.requireActual('@cowprotocol/wallet-provider'),
  useWalletProvider: jest.fn(),
}))

const mockedGetRpcProvider = jest.mocked(getRpcProvider)
const mockedRetry = jest.mocked(retry)
const mockedUseWalletProvider = jest.mocked(useWalletProvider)

interface ReceiptProviderMock {
  getTransactionReceipt: jest.Mock<Promise<TransactionReceipt | null>, [string]>
}

function createProviderMock(): ReceiptProviderMock {
  return {
    getTransactionReceipt: jest.fn(),
  }
}

describe('useGetReceipt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'debug').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('falls back to the public RPC provider when the wallet provider receipt lookup fails', async () => {
    const walletProvider = createProviderMock()
    const rpcProvider = createProviderMock()
    const receipt = { status: 1 } as TransactionReceipt

    walletProvider.getTransactionReceipt.mockRejectedValue(new Error('wallet rate limited'))
    rpcProvider.getTransactionReceipt.mockResolvedValue(receipt)

    mockedUseWalletProvider.mockReturnValue(walletProvider as unknown as Web3Provider)
    mockedGetRpcProvider.mockReturnValue(rpcProvider as unknown as JsonRpcProvider)

    const { result } = renderHook(() => useGetReceipt(SupportedChainId.BASE))

    await expect(result.current('0xhash').promise).resolves.toBe(receipt)
    expect(walletProvider.getTransactionReceipt).toHaveBeenCalledWith('0xhash')
    expect(rpcProvider.getTransactionReceipt).toHaveBeenCalledWith('0xhash')
  })

  it('uses the public RPC provider when the wallet provider is unavailable', async () => {
    const rpcProvider = createProviderMock()
    const receipt = { status: 1 } as TransactionReceipt

    rpcProvider.getTransactionReceipt.mockResolvedValue(receipt)

    mockedUseWalletProvider.mockReturnValue(undefined)
    mockedGetRpcProvider.mockReturnValue(rpcProvider as unknown as JsonRpcProvider)

    const { result } = renderHook(() => useGetReceipt(SupportedChainId.BASE))

    await expect(result.current('0xhash').promise).resolves.toBe(receipt)
    expect(rpcProvider.getTransactionReceipt).toHaveBeenCalledWith('0xhash')
  })

  it('requests a retry when no provider can return a receipt yet', async () => {
    const walletProvider = createProviderMock()
    const rpcProvider = createProviderMock()

    walletProvider.getTransactionReceipt.mockResolvedValue(null)
    rpcProvider.getTransactionReceipt.mockResolvedValue(null)

    mockedUseWalletProvider.mockReturnValue(walletProvider as unknown as Web3Provider)
    mockedGetRpcProvider.mockReturnValue(rpcProvider as unknown as JsonRpcProvider)

    const { result } = renderHook(() => useGetReceipt(SupportedChainId.BASE))

    await expect(result.current('0xhash').promise).rejects.toBeInstanceOf(RetryableError)
    expect(mockedRetry).toHaveBeenCalled()
  })
})
