import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { updateSolanaCreatingOrders } from './PendingOrdersUpdater'

const SOLANA_CHAIN_ID = ChainId.SOLANA

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    status: OrderStatus.CREATING,
    orderCreationHash: 'tx-hash-1',
    ...overrides,
  } as Order
}

function buildTx(overrides: Partial<EnhancedTransactionDetails> = {}): EnhancedTransactionDetails {
  return {
    hash: 'tx-hash-1',
    hashType: 0,
    transactionHash: 'tx-hash-1',
    nonce: 0,
    addedTime: Date.now(),
    from: 'account-1',
    ...overrides,
  } as EnhancedTransactionDetails
}

describe('updateSolanaCreatingOrders', () => {
  it('does nothing when the order has no matching transaction yet', () => {
    const addOrUpdateOrders = jest.fn()
    updateSolanaCreatingOrders(SOLANA_CHAIN_ID, [buildOrder()], {}, false, addOrUpdateOrders)
    expect(addOrUpdateOrders).not.toHaveBeenCalled()
  })

  it('does nothing while the transaction has no receipt yet', () => {
    const addOrUpdateOrders = jest.fn()
    const allTransactions = { 'tx-hash-1': buildTx() }
    updateSolanaCreatingOrders(SOLANA_CHAIN_ID, [buildOrder()], allTransactions, false, addOrUpdateOrders)
    expect(addOrUpdateOrders).not.toHaveBeenCalled()
  })

  it('moves the order to the PENDING bucket when the transaction receipt succeeded', () => {
    const addOrUpdateOrders = jest.fn()
    const order = buildOrder()
    const allTransactions = {
      'tx-hash-1': buildTx({ receipt: { status: 'success' } as EnhancedTransactionDetails['receipt'] }),
    }
    updateSolanaCreatingOrders(SOLANA_CHAIN_ID, [order], allTransactions, false, addOrUpdateOrders)
    expect(addOrUpdateOrders).toHaveBeenCalledWith({
      chainId: SOLANA_CHAIN_ID,
      orders: [{ ...order, status: OrderStatus.PENDING }],
      isSafeWallet: false,
    })
  })

  it('moves the order to the FAILED bucket when the transaction receipt reverted', () => {
    const addOrUpdateOrders = jest.fn()
    const order = buildOrder()
    const allTransactions = {
      'tx-hash-1': buildTx({ receipt: { status: 'reverted' } as EnhancedTransactionDetails['receipt'] }),
    }
    updateSolanaCreatingOrders(SOLANA_CHAIN_ID, [order], allTransactions, false, addOrUpdateOrders)
    expect(addOrUpdateOrders).toHaveBeenCalledWith({
      chainId: SOLANA_CHAIN_ID,
      orders: [{ ...order, status: OrderStatus.FAILED }],
      isSafeWallet: false,
    })
  })

  it('ignores orders that are not CREATING', () => {
    const addOrUpdateOrders = jest.fn()
    const allTransactions = {
      'tx-hash-1': buildTx({ receipt: { status: 'success' } as EnhancedTransactionDetails['receipt'] }),
    }
    updateSolanaCreatingOrders(
      SOLANA_CHAIN_ID,
      [buildOrder({ status: OrderStatus.PENDING })],
      allTransactions,
      false,
      addOrUpdateOrders,
    )
    expect(addOrUpdateOrders).not.toHaveBeenCalled()
  })
})
