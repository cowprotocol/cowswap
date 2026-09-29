import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { waitFor } from '@testing-library/react'
import { orderBookApi } from 'cowSdk'

import { checkedTransaction, finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'
import { updateOrder } from 'legacy/state/orders/actions'

import { emitOnchainTransactionEvent } from 'modules/onchainTransactions/utils/emitOnchainTransactionEvent'
import { emitCancelledOrderEvent } from 'modules/orders'

import { checkSolanaTransaction, HISTORICAL_LOOKUP_GRACE_PERIOD_MS } from './checkSolanaTransaction'

import { CheckEthereumTransactions } from '../types'

import type { Connection, SignatureStatus } from '@solana/web3.js'

jest.mock('cowSdk', () => ({
  orderBookApi: {
    getOrderMultiEnv: jest.fn(),
  },
}))

jest.mock('modules/orders', () => ({
  emitCancelledOrderEvent: jest.fn(),
}))

jest.mock('modules/onchainTransactions/utils/emitOnchainTransactionEvent', () => ({
  emitOnchainTransactionEvent: jest.fn(),
}))

const SIGNATURE = '5x8VXqZ8pQ2mJ7Yb1kL3nR4tW6uH9dF2sG5cA7eB1vN3mK4pQ8rT2yU6iO9aS1dF'
const ACCOUNT = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
const LAST_VALID_BLOCK_HEIGHT = 1_000

function createTransaction(addedTime = Date.now()): EnhancedTransactionDetails {
  return {
    hash: SIGNATURE,
    transactionHash: SIGNATURE,
    hashType: HashType.SOLANA_TX,
    nonce: 0,
    addedTime,
    from: ACCOUNT,
    summary: 'Wrap 1 SOL to WSOL',
    data: { lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT },
  } as EnhancedTransactionDetails
}

const transaction = createTransaction()

function createParams({
  status,
  blockHeight = LAST_VALID_BLOCK_HEIGHT - 1,
  historicalStatus = null,
}: {
  status: SignatureStatus | null
  blockHeight?: number
  /** What a `searchTransactionHistory` lookup finds, which reaches beyond the recent status cache. */
  historicalStatus?: SignatureStatus | null
}): {
  params: CheckEthereumTransactions
  dispatch: jest.Mock
  getSignatureStatuses: jest.Mock
  cancelOrdersBatch: jest.Mock
} {
  const dispatch = jest.fn()
  const cancelOrdersBatch = jest.fn()

  const getSignatureStatuses = jest.fn(
    async (_signatures: string[], config?: { searchTransactionHistory?: boolean }) => ({
      context: { slot: 42 },
      value: [config?.searchTransactionHistory ? historicalStatus : status],
    }),
  )

  const solanaConnection = {
    getSignatureStatuses,
    getBlockHeight: jest.fn().mockResolvedValue(blockHeight),
  } as unknown as Connection

  return {
    dispatch,
    getSignatureStatuses,
    cancelOrdersBatch,
    params: {
      chainId: SupportedChainId.SOLANA,
      account: ACCOUNT,
      dispatch,
      solanaConnection,
      lastBlockNumber: 42,
      isSafeWallet: false,
      cancelOrdersBatch,
    } as unknown as CheckEthereumTransactions,
  }
}

describe('checkSolanaTransaction', () => {
  it('finalizes as successful once the signature is confirmed', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
    })

    checkSolanaTransaction(transaction, params)

    await waitFor(() => expect(dispatch).toHaveBeenCalled())

    expect(dispatch).toHaveBeenCalledWith(
      finalizeTransaction({
        chainId: SupportedChainId.SOLANA,
        hash: SIGNATURE,
        receipt: {
          to: null,
          from: ACCOUNT,
          contractAddress: null,
          transactionIndex: 0,
          blockHash: '',
          transactionHash: SIGNATURE,
          blockNumber: 42,
          status: 'success',
        },
      }),
    )
  })

  it('finalizes as reverted when the transaction failed on chain', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: { InstructionError: [0, 'Custom'] }, confirmationStatus: 'confirmed' },
    })

    checkSolanaTransaction(transaction, params)

    await waitFor(() => expect(dispatch).toHaveBeenCalled())

    expect(dispatch.mock.calls[0][0].payload.receipt.status).toBe('reverted')
  })

  it('keeps waiting while the signature is unknown and the blockhash is still valid', async () => {
    const { params, dispatch } = createParams({ status: null })

    checkSolanaTransaction(transaction, params)

    await waitFor(() => expect(dispatch).toHaveBeenCalled())

    expect(dispatch).toHaveBeenCalledWith(
      checkedTransaction({ chainId: SupportedChainId.SOLANA, hash: SIGNATURE, blockNumber: 42 }),
    )
  })

  describe('when the signature has aged out of the recent status cache', () => {
    // The status cache only spans ~150 slots, so a landed transaction reads back as `null` once the
    // user leaves the tab (slot polling stops) or reloads. Absence there is not proof of failure.
    it('confirms against transaction history rather than declaring failure', async () => {
      const { params, dispatch, getSignatureStatuses } = createParams({
        status: null,
        blockHeight: LAST_VALID_BLOCK_HEIGHT + 1,
        historicalStatus: { slot: 99, confirmations: null, err: null, confirmationStatus: 'finalized' },
      })

      checkSolanaTransaction(transaction, params)

      await waitFor(() => expect(dispatch).toHaveBeenCalled())

      expect(dispatch.mock.calls[0][0].payload.receipt.status).toBe('success')
      expect(dispatch.mock.calls[0][0].payload.receipt.blockNumber).toBe(99)
      expect(getSignatureStatuses).toHaveBeenLastCalledWith([SIGNATURE], { searchTransactionHistory: true })
    })

    it('still reports a genuine on-chain failure found in history', async () => {
      const { params, dispatch } = createParams({
        status: null,
        blockHeight: LAST_VALID_BLOCK_HEIGHT + 1,
        historicalStatus: {
          slot: 99,
          confirmations: null,
          err: { InstructionError: [0, 'Custom'] },
          confirmationStatus: 'finalized',
        },
      })

      checkSolanaTransaction(transaction, params)

      await waitFor(() => expect(dispatch).toHaveBeenCalled())

      expect(dispatch.mock.calls[0][0].payload.receipt.status).toBe('reverted')
    })

    it('does not pay for a history search while the blockhash is still valid', async () => {
      const { params, getSignatureStatuses } = createParams({ status: null })

      checkSolanaTransaction(transaction, params)

      await waitFor(() => expect(getSignatureStatuses).toHaveBeenCalled())

      expect(getSignatureStatuses).toHaveBeenCalledTimes(1)
      expect(getSignatureStatuses).toHaveBeenCalledWith([SIGNATURE])
    })

    describe('and transaction history has no record either', () => {
      // A landed transaction can outrun the RPC provider's own archival ingestion, so absence there
      // right after expiry is not proof of failure — only proof we asked too soon.
      it('keeps waiting rather than immediately declaring the transaction dropped', async () => {
        const recentTransaction = createTransaction(Date.now())
        const { params, dispatch } = createParams({ status: null, blockHeight: LAST_VALID_BLOCK_HEIGHT + 1 })

        checkSolanaTransaction(recentTransaction, params)

        await waitFor(() => expect(dispatch).toHaveBeenCalled())

        expect(dispatch).toHaveBeenCalledWith(
          checkedTransaction({ chainId: SupportedChainId.SOLANA, hash: SIGNATURE, blockNumber: 42 }),
        )
      })

      it('finalizes as reverted once the grace period has elapsed with still no record anywhere', async () => {
        const staleTransaction = createTransaction(Date.now() - HISTORICAL_LOOKUP_GRACE_PERIOD_MS - 1)
        const { params, dispatch } = createParams({ status: null, blockHeight: LAST_VALID_BLOCK_HEIGHT + 1 })

        checkSolanaTransaction(staleTransaction, params)

        await waitFor(() => expect(dispatch).toHaveBeenCalled())

        expect(dispatch.mock.calls[0][0].payload.receipt.status).toBe('reverted')
      })
    })
  })

  it('does not dispatch anything after being cancelled', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
    })

    const cancel = checkSolanaTransaction(transaction, params)
    cancel()

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(dispatch).not.toHaveBeenCalled()
  })

  describe('when the transaction cancels an order', () => {
    const ORDER_ID = '0xorder'
    const cancelTransaction = {
      ...createTransaction(),
      onChainCancellation: { orderId: ORDER_ID, sellTokenSymbol: 'COW' },
    } as EnhancedTransactionDetails

    beforeEach(() => {
      jest.clearAllMocks()
    })

    const UNFILLED_ORDER = {
      uid: ORDER_ID,
      kind: 'sell',
      sellAmount: '100',
      buyAmount: '200',
      executedSellAmount: '0',
      executedBuyAmount: '0',
      executedSellAmountBeforeFees: '0',
    }

    it('marks the order as cancelled once the cancellation lands on chain', async () => {
      const { params, dispatch, cancelOrdersBatch } = createParams({
        status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      })
      ;(orderBookApi.getOrderMultiEnv as jest.Mock).mockResolvedValue(UNFILLED_ORDER)

      checkSolanaTransaction(cancelTransaction, params)

      await waitFor(() => expect(cancelOrdersBatch).toHaveBeenCalled())

      expect(cancelOrdersBatch).toHaveBeenCalledWith({
        chainId: SupportedChainId.SOLANA,
        ids: [ORDER_ID],
        isSafeWallet: false,
      })
      expect(dispatch).not.toHaveBeenCalledWith(updateOrder(expect.anything()))

      await waitFor(() => expect(emitCancelledOrderEvent).toHaveBeenCalled())
      expect(emitCancelledOrderEvent).toHaveBeenCalledWith({
        chainId: SupportedChainId.SOLANA,
        order: UNFILLED_ORDER,
        transactionHash: SIGNATURE,
      })

      // Like EVM's on-chain cancellation, a successful cancellation gets no activity-list entry or
      // completion snackbar of its own.
      expect(emitOnchainTransactionEvent).not.toHaveBeenCalled()
    })

    // The exact race a user hit: cancelling an order right as a solver's fill lands. Without this
    // check, the order would flash "Cancelled" in the UI before the normal fulfilled-order detection
    // corrected it a moment later.
    it('does not mark the order as cancelled when the order-book already shows it fulfilled', async () => {
      const { params, cancelOrdersBatch } = createParams({
        status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      })
      ;(orderBookApi.getOrderMultiEnv as jest.Mock).mockResolvedValue({
        ...UNFILLED_ORDER,
        executedSellAmount: '100',
        executedSellAmountBeforeFees: '100',
      })

      checkSolanaTransaction(cancelTransaction, params)

      await waitFor(() => expect(orderBookApi.getOrderMultiEnv).toHaveBeenCalled())
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(cancelOrdersBatch).not.toHaveBeenCalled()
      expect(emitCancelledOrderEvent).not.toHaveBeenCalled()
    })

    it('clears the cancelling flag and emits a failure snackbar when the cancellation fails on chain', async () => {
      const { params, dispatch, cancelOrdersBatch } = createParams({
        status: {
          slot: 42,
          confirmations: 1,
          err: { InstructionError: [0, 'Custom'] },
          confirmationStatus: 'confirmed',
        },
      })

      checkSolanaTransaction(cancelTransaction, params)

      await waitFor(() =>
        expect(dispatch).toHaveBeenCalledWith(
          updateOrder({
            chainId: SupportedChainId.SOLANA,
            order: { id: ORDER_ID, isCancelling: false, cancellationHash: undefined },
            isSafeWallet: false,
          }),
        ),
      )

      expect(cancelOrdersBatch).not.toHaveBeenCalled()
      // Unlike the silent success path, a failed cancellation does get a snackbar - same as EVM.
      expect(emitOnchainTransactionEvent).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Failed to cancel order selling COW' }),
      )
    })
  })

  describe('when the transaction cancels several orders in one batch', () => {
    const ORDER_IDS = ['0xorder1', '0xorder2']
    const batchCancelTransaction = {
      ...createTransaction(),
      solanaCancelOrderIds: ORDER_IDS,
    } as EnhancedTransactionDetails

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('marks every order in the batch as cancelled once the cancellation lands on chain', async () => {
      const { params, cancelOrdersBatch } = createParams({
        status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      })
      ;(orderBookApi.getOrderMultiEnv as jest.Mock).mockImplementation(async (orderId: string) => ({
        uid: orderId,
        kind: 'sell',
        sellAmount: '100',
        buyAmount: '200',
        executedSellAmount: '0',
        executedBuyAmount: '0',
        executedSellAmountBeforeFees: '0',
      }))

      checkSolanaTransaction(batchCancelTransaction, params)

      await waitFor(() => expect(cancelOrdersBatch).toHaveBeenCalledTimes(ORDER_IDS.length))

      ORDER_IDS.forEach((orderId) => {
        expect(cancelOrdersBatch).toHaveBeenCalledWith({
          chainId: SupportedChainId.SOLANA,
          ids: [orderId],
          isSafeWallet: false,
        })
      })
      expect(emitOnchainTransactionEvent).not.toHaveBeenCalled()
    })

    it('clears every order in the batch and emits a single failure snackbar when the cancellation fails on chain', async () => {
      const { params, dispatch, cancelOrdersBatch } = createParams({
        status: {
          slot: 42,
          confirmations: 1,
          err: { InstructionError: [0, 'Custom'] },
          confirmationStatus: 'confirmed',
        },
      })

      checkSolanaTransaction(batchCancelTransaction, params)

      await waitFor(() =>
        ORDER_IDS.forEach((orderId) => {
          expect(dispatch).toHaveBeenCalledWith(
            updateOrder({
              chainId: SupportedChainId.SOLANA,
              order: { id: orderId, isCancelling: false, cancellationHash: undefined },
              isSafeWallet: false,
            }),
          )
        }),
      )

      expect(cancelOrdersBatch).not.toHaveBeenCalled()
      expect(emitOnchainTransactionEvent).toHaveBeenCalledTimes(1)
      expect(emitOnchainTransactionEvent).toHaveBeenCalledWith(
        expect.objectContaining({ summary: `Failed to cancel ${ORDER_IDS.length} orders` }),
      )
    })
  })
})
