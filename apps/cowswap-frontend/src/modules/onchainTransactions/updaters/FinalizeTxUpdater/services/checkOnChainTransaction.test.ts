import { getRpcProvider } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

import { renderHook, waitFor } from '@testing-library/react'

import { finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'
import { invalidateOrdersBatch } from 'legacy/state/orders/actions'

import { useGetReceipt } from 'common/hooks/useGetReceipt'

import { checkOnChainTransaction } from './checkOnChainTransaction'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  getRpcProvider: jest.fn(),
}))

jest.mock('@cowprotocol/wallet-provider', () => ({
  ...jest.requireActual('@cowprotocol/wallet-provider'),
  useWalletProvider: jest.fn(),
}))

jest.mock('../../../utils/emitOnchainTransactionEvent', () => ({
  emitOnchainTransactionEvent: jest.fn(),
}))

jest.mock('./finalizeOnChainCancellation', () => ({
  finalizeOnChainCancellation: jest.fn(),
}))

const mockedGetRpcProvider = jest.mocked(getRpcProvider)
const mockedUseWalletProvider = jest.mocked(useWalletProvider)
const mockedEmitOnchainTransactionEvent = jest.mocked(emitOnchainTransactionEvent)

interface ReceiptProviderMock {
  getTransactionReceipt: jest.Mock<Promise<TransactionReceipt | null>, [string]>
}

function createEthFlowTransaction(): EnhancedTransactionDetails {
  return {
    addedTime: Date.now(),
    ethFlow: {
      orderId: '0xorder',
      subType: 'creation',
    },
    from: '0xfrom',
    hash: '0xhash',
    hashType: HashType.ETHEREUM_TX,
    nonce: 5,
    transactionHash: '0xhash',
  }
}

function createParams(getReceipt: ReturnType<typeof useGetReceipt>, dispatch: jest.Mock): CheckEthereumTransactions {
  return {
    account: '0xfrom',
    cancelOrdersBatch: jest.fn() as unknown as CheckEthereumTransactions['cancelOrdersBatch'],
    chainId: SupportedChainId.BASE,
    dispatch: dispatch as unknown as CheckEthereumTransactions['dispatch'],
    getReceipt,
    getTwapOrderById: jest.fn() as unknown as CheckEthereumTransactions['getTwapOrderById'],
    getTxSafeInfo: jest.fn() as unknown as CheckEthereumTransactions['getTxSafeInfo'],
    isSafeWallet: false,
    lastBlockNumber: 456,
    nativeCurrencySymbol: 'ETH',
    safeInfo: undefined,
    transactionsCount: 5,
  }
}

function createProviderMock(): ReceiptProviderMock {
  return {
    getTransactionReceipt: jest.fn(),
  }
}

function createReceipt(status: number): TransactionReceipt {
  return {
    blockHash: '0xblock',
    blockNumber: 123,
    contractAddress: '0xcontract',
    from: '0xfrom',
    status,
    to: '0xto',
    transactionHash: '0xhash',
    transactionIndex: 7,
  } as TransactionReceipt
}

describe('checkOnChainTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'debug').mockImplementation(() => undefined)
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('invalidates an ETH-flow order when the wallet receipt lookup fails but public RPC returns a failed receipt', async () => {
    const walletProvider = createProviderMock()
    const rpcProvider = createProviderMock()
    const receipt = createReceipt(0)
    const dispatch = jest.fn()

    walletProvider.getTransactionReceipt.mockRejectedValue(new Error('wallet rate limited'))
    rpcProvider.getTransactionReceipt.mockResolvedValue(receipt)

    mockedUseWalletProvider.mockReturnValue(walletProvider as unknown as Web3Provider)
    mockedGetRpcProvider.mockReturnValue(rpcProvider as unknown as JsonRpcProvider)

    const { result } = renderHook(() => useGetReceipt(SupportedChainId.BASE))
    const params = createParams(result.current, dispatch)
    const transaction = createEthFlowTransaction()

    checkOnChainTransaction(transaction, params)

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith(
        finalizeTransaction({
          chainId: SupportedChainId.BASE,
          hash: '0xhash',
          receipt: {
            blockHash: '0xblock',
            blockNumber: 123,
            contractAddress: '0xcontract',
            from: '0xfrom',
            status: 0,
            to: '0xto',
            transactionHash: '0xhash',
            transactionIndex: 7,
          },
        }),
      )
      expect(dispatch).toHaveBeenCalledWith(
        invalidateOrdersBatch({
          chainId: SupportedChainId.BASE,
          ids: ['0xorder'],
          isSafeWallet: false,
        }),
      )
    })

    expect(walletProvider.getTransactionReceipt).toHaveBeenCalledWith('0xhash')
    expect(rpcProvider.getTransactionReceipt).toHaveBeenCalledWith('0xhash')
    expect(mockedEmitOnchainTransactionEvent).toHaveBeenCalledTimes(1)
  })
})
