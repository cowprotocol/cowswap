import type { TransactionReceipt } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { orderBookApi } from 'cowSdk'

import type { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { emitCancelledOrderEvent } from 'modules/orders'

import { finalizeOnChainCancellation } from './finalizeOnChainCancellation'

import type { CheckEthereumTransactions } from '../types'

jest.mock('cowSdk', () => ({
  orderBookApi: { getOrderMultiEnv: jest.fn() },
}))
jest.mock('legacy/state/orders/utils', () => ({
  partialOrderUpdate: jest.fn(),
}))
jest.mock('modules/orders', () => ({
  emitCancelledOrderEvent: jest.fn(),
}))
jest.mock('../../../utils/emitOnchainTransactionEvent', () => ({
  emitOnchainTransactionEvent: jest.fn(),
}))

const emitCancelledOrderEventMock = emitCancelledOrderEvent as jest.MockedFunction<typeof emitCancelledOrderEvent>
const getOrderMultiEnvMock = orderBookApi.getOrderMultiEnv as jest.MockedFunction<typeof orderBookApi.getOrderMultiEnv>

const EVENT_ID = '49821'
const CONDITIONAL_ORDER_HASH = `0x${'ab'.repeat(32)}`
const EOA = '0x1111111111111111111111111111111111111111'
const PROXY = '0x2222222222222222222222222222222222222222'
const CHAIN_ID = SupportedChainId.MAINNET

const transaction = { replacementType: undefined } as unknown as EnhancedTransactionDetails
const successReceipt = { status: 'success' } as unknown as TransactionReceipt
const revertedReceipt = {
  status: 'reverted',
  to: PROXY,
  from: EOA,
  contractAddress: null,
  transactionHash: '0xtx',
  blockNumber: 1n,
} as unknown as TransactionReceipt

describe('finalizeOnChainCancellation', () => {
  const getTwapOrderById = jest.fn()
  const params = {
    chainId: CHAIN_ID,
    isSafeWallet: false,
    dispatch: jest.fn(),
    cancelOrdersBatch: jest.fn(),
    getTwapOrderById,
  } as unknown as CheckEthereumTransactions

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('emits indexed EOA cancellation analytics only after a successful receipt', () => {
    getTwapOrderById.mockReturnValue({
      order: { uid: EVENT_ID, owner: PROXY },
      isEoaTwap: true,
      analyticsOrderId: CONDITIONAL_ORDER_HASH,
      analyticsWalletAddress: EOA,
    })

    finalizeOnChainCancellation(transaction, revertedReceipt, params, '0xtx', EVENT_ID, 'SELL')
    expect(emitCancelledOrderEventMock).not.toHaveBeenCalled()

    finalizeOnChainCancellation(transaction, successReceipt, params, '0xtx', EVENT_ID, 'SELL')
    expect(emitCancelledOrderEventMock).toHaveBeenCalledWith({
      chainId: CHAIN_ID,
      order: { uid: EVENT_ID, owner: PROXY },
      orderType: UiOrderType.TWAP,
      transactionHash: '0xtx',
      isEoaTwap: true,
      analyticsOrderId: CONDITIONAL_ORDER_HASH,
      analyticsWalletAddress: EOA,
    })
  })

  it('omits TWAP analytics flags when cancelling an ordinary order', async () => {
    const order = { uid: `0x${'12'.repeat(56)}`, owner: EOA }
    getTwapOrderById.mockReturnValue(null)
    getOrderMultiEnvMock.mockResolvedValue(order as Awaited<ReturnType<typeof orderBookApi.getOrderMultiEnv>>)

    finalizeOnChainCancellation(transaction, successReceipt, params, '0xtx', order.uid, 'SELL')
    await Promise.resolve()

    expect(emitCancelledOrderEventMock).toHaveBeenCalledWith({
      chainId: CHAIN_ID,
      order,
      transactionHash: '0xtx',
    })
  })
})
