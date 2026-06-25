import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { usePublicClient } from 'wagmi'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useWalletClientWithFallback } from 'common/hooks/useWalletClientWithFallback'

import { useApproveCallback } from './useApproveCallback'

import { LinguiWrapper } from '../../../../LinguiJestProvider'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('legacy/state/enhancedTransactions/hooks', () => ({
  useTransactionAdder: jest.fn(),
}))

jest.mock('wagmi', () => ({
  usePublicClient: jest.fn(),
}))

jest.mock('common/hooks/useWalletClientWithFallback', () => ({
  useWalletClientWithFallback: jest.fn(),
}))

const ACCOUNT = '0xD3a9cc6645cAF5A6885ddc9b0c09Dd760a7DB053'
const SPENDER = '0x9008d19f58aabd9ed0d60971565aa8510560ab41'
const TX_HASH = '0x15de6602b39be44ce9e6b57245deb4ee64ad28286c0f9f8094a6af2016e30591'
const TOKEN = new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USDC')

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUsePublicClient = usePublicClient as jest.MockedFunction<typeof usePublicClient>
const mockUseTransactionAdder = useTransactionAdder as jest.MockedFunction<typeof useTransactionAdder>
const mockUseWalletClientWithFallback = useWalletClientWithFallback as jest.MockedFunction<
  typeof useWalletClientWithFallback
>

describe('useApproveCallback', () => {
  const estimateContractGas = jest.fn()
  const writeContract = jest.fn()
  const addTransaction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({
      chainId: SupportedChainId.MAINNET,
      account: ACCOUNT,
    } as ReturnType<typeof useWalletInfo>)

    mockUsePublicClient.mockReturnValue({
      estimateContractGas,
    } as ReturnType<typeof usePublicClient>)

    mockUseWalletClientWithFallback.mockReturnValue({
      walletClient: {
        account: { address: ACCOUNT },
        writeContract,
      },
      walletClientSource: 'injected-fallback',
      walletClientQuery: {},
    } as ReturnType<typeof useWalletClientWithFallback>)

    mockUseTransactionAdder.mockReturnValue(addTransaction)
    estimateContractGas.mockResolvedValue(100_000n)
    writeContract.mockResolvedValue(TX_HASH)
  })

  it('uses the restored wallet client for ERC-20 approvals', async () => {
    const { result } = renderHook(() => useApproveCallback(TOKEN, SPENDER), { wrapper: LinguiWrapper })
    const amount = CurrencyAmount.fromRawAmount(TOKEN, '1000')

    const response = await result.current(amount)

    expect(mockUseWalletClientWithFallback).toHaveBeenCalledWith({
      chainId: SupportedChainId.MAINNET,
      account: ACCOUNT,
    })
    expect(estimateContractGas).toHaveBeenCalledWith(
      expect.objectContaining({
        address: TOKEN.address,
        args: [SPENDER, 1000n],
        account: ACCOUNT,
      }),
    )
    expect(writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: TOKEN.address,
        args: [SPENDER, 1000n],
        account: ACCOUNT,
        chain: null,
      }),
    )
    expect(addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        hash: TX_HASH,
        approval: {
          tokenAddress: TOKEN.address,
          spender: SPENDER,
          amount: '0x3e8',
        },
      }),
    )
    expect(response).toEqual({ hash: TX_HASH })
  })
})
