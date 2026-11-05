import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { waitFor } from '@testing-library/react'
import { orderBookApi } from 'cowSdk'

import { checkedTransaction, finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'
import { invalidateOrdersBatch, updateOrder } from 'legacy/state/orders/actions'

import { emitOnchainTransactionEvent } from 'modules/onchainTransactions/utils/emitOnchainTransactionEvent'
import { emitCancelledOrderEvent } from 'modules/orders'

import { checkSolanaTransaction, HISTORICAL_LOOKUP_GRACE_PERIOD_MS } from './checkSolanaTransaction'
import { getSquadsProposalOutcome } from './getSquadsProposalOutcome'

import { CheckEthereumTransactions } from '../types'

import type { Connection, SignatureStatus } from '@solana/web3.js'

jest.mock('cowSdk', () => ({
  orderBookApi: {
    getOrderMultiEnv: jest.fn(),
  },
}))

jest.mock('modules/orders', () => ({
  emitCancelledOrderEvent: jest.fn(),
  orderFailureReasonsAtom: jest.requireActual('jotai').atom({}),
}))

// The real service derives a Squads PDA, which jsdom's crypto shim cannot do; its own suite covers the
// decoding. What matters here is that the updater acts on each outcome.
jest.mock('./getSquadsProposalOutcome', () => ({ getSquadsProposalOutcome: jest.fn() }))

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

// A real Squads vault: off the ed25519 curve, so `getIsSolanaSmartContractWallet` recognises it.
const VAULT = 'D9DvzXZjyqECswED5YgHi4wA1qTVjjiGP76sN6Dr8vGE'

/** Each multisig test needs its own signature, matching how the real service memoises per signature. */
function buildMultisigTransaction(hash: string): EnhancedTransactionDetails {
  return {
    ...createTransaction(),
    hash,
    transactionHash: hash,
    from: VAULT,
    solanaOrderCreation: { orderId: ORDER_ID },
  }
}

function createParams({
  status,
  blockHeight = LAST_VALID_BLOCK_HEIGHT - 1,
  historicalStatus = null,
  proposalOutcome = 'unresolved',
}: {
  status: SignatureStatus | null
  blockHeight?: number
  /** What a `searchTransactionHistory` lookup finds, which reaches beyond the recent status cache. */
  historicalStatus?: SignatureStatus | null
  /** What the Squads service reports for the owner's multisig. */
  proposalOutcome?: 'failed' | 'executed' | 'unresolved'
}): {
  params: CheckEthereumTransactions
  dispatch: jest.Mock
  getSignatureStatuses: jest.Mock
  cancelOrdersBatch: jest.Mock
} {
  const dispatch = jest.fn()
  const cancelOrdersBatch = jest.fn()

  jest.mocked(getSquadsProposalOutcome).mockResolvedValue(proposalOutcome)

  const getSignatureStatuses = jest.fn(
    async (_signatures: string[], config?: { searchTransactionHistory?: boolean }) => ({
      context: { slot: 42 },
      value: [config?.searchTransactionHistory ? historicalStatus : status],
    }),
  )

  const solanaConnection = {
    getSignatureStatuses,
    getBlockHeight: jest.fn().mockResolvedValue(blockHeight),
    getTransaction: jest.fn(),
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

const ORDER_ID = '0x' + 'cd'.repeat(32)
const REVERTED = {
  slot: 42,
  confirmations: 1,
  err: { InstructionError: [0, 'Custom'] },
  confirmationStatus: 'confirmed',
} as SignatureStatus
const FAILED_ORDER = invalidateOrdersBatch({ chainId: SupportedChainId.SOLANA, ids: [ORDER_ID], isSafeWallet: false })

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

  // The order lives only in local state until the order book indexes this transaction, and the book is
  // never told about one whose transaction died. Nothing else links the two, so if this does not fail
  // the order it polls for an id that will never resolve and sits in CREATING indefinitely.
  describe('order creation', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    function createOrderCreationTransaction(): EnhancedTransactionDetails {
      return { ...createTransaction(), solanaOrderCreation: { orderId: ORDER_ID } } as EnhancedTransactionDetails
    }

    it('fails the order it created when the transaction reverts', async () => {
      const { params, dispatch } = createParams({ status: REVERTED })

      checkSolanaTransaction(createOrderCreationTransaction(), params)

      await waitFor(() => expect(dispatch).toHaveBeenCalledWith(FAILED_ORDER))

      expect(emitOnchainTransactionEvent).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Failed to place order' }),
      )
    })

    // A dropped transaction only resolves once the chain passes the blockhash's lastValidBlockHeight.
    it('fails the order when the creation transaction is dropped', async () => {
      const { params, dispatch } = createParams({
        status: null,
        blockHeight: LAST_VALID_BLOCK_HEIGHT + 1,
        historicalStatus: null,
      })

      checkSolanaTransaction(
        { ...createOrderCreationTransaction(), addedTime: Date.now() - HISTORICAL_LOOKUP_GRACE_PERIOD_MS - 1 },
        params,
      )

      await waitFor(() => expect(dispatch).toHaveBeenCalledWith(FAILED_ORDER))
    })

    // Persisted before the id was carried, this field is a plain `true`: truthy but naming no order,
    // so claiming a failure would say "Failed to place order" while leaving the order in Creating.
    it('stays quiet for a transaction stored before the order id was carried', async () => {
      const { params, dispatch } = createParams({ status: REVERTED })

      checkSolanaTransaction(
        { ...createTransaction(), solanaOrderCreation: true } as unknown as EnhancedTransactionDetails,
        params,
      )

      await waitFor(() => expect(dispatch).toHaveBeenCalled())

      expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: invalidateOrdersBatch.type }))
      expect(emitOnchainTransactionEvent).not.toHaveBeenCalled()
    })

    it('leaves the order alone when the creation transaction lands', async () => {
      const { params, dispatch } = createParams({
        status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      })

      checkSolanaTransaction(createOrderCreationTransaction(), params)

      await waitFor(() => expect(dispatch).toHaveBeenCalled())

      expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: invalidateOrdersBatch.type }))
      // The order carries this activity itself, so the generic transaction snackbar stays suppressed.
      expect(emitOnchainTransactionEvent).not.toHaveBeenCalled()
    })
  })
})

describe('checkSolanaTransaction with a multisig owner', () => {
  const CANCEL_ORDER_ID = '0x' + 'ef'.repeat(32)

  function buildMultisigCancellation(hash: string): EnhancedTransactionDetails {
    return {
      ...createTransaction(),
      hash,
      transactionHash: hash,
      from: VAULT,
      solanaCancelOrderIds: [CANCEL_ORDER_ID],
    } as EnhancedTransactionDetails
  }

  // The path the cancel button actually takes: `useSolanaCancelOrder` records `onChainCancellation`,
  // while `solanaCancelOrderIds` only comes from the batch hook behind "cancel all".
  it('names the rejection on a single-order cancellation too', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      proposalOutcome: 'failed',
    })
    const singleCancel = {
      ...createTransaction(),
      hash: 'rejected-single-cancel-signature',
      from: VAULT,
      onChainCancellation: { orderId: ORDER_ID, sellTokenSymbol: 'USDC' },
    } as EnhancedTransactionDetails

    checkSolanaTransaction(singleCancel, params)

    await waitFor(() => expect(dispatch).toHaveBeenCalled())

    expect(emitOnchainTransactionEvent).toHaveBeenCalledWith(
      expect.objectContaining({ summary: 'Cancellation rejected in your multisig' }),
    )
  })

  // The dangerous direction: telling the user an order is cancelled while the members have not voted
  // leaves a live, fillable order behind a "Cancelled" label.
  it('does not cancel orders while the cancellation proposal is still awaiting votes', async () => {
    const { params, cancelOrdersBatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      proposalOutcome: 'unresolved',
    })

    checkSolanaTransaction(buildMultisigCancellation('pending-cancel-signature'), params)

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(cancelOrdersBatch).not.toHaveBeenCalled()
  })

  it('cancels the orders once the cancellation proposal is executed', async () => {
    const { params, cancelOrdersBatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      proposalOutcome: 'executed',
    })
    ;(orderBookApi.getOrderMultiEnv as jest.Mock).mockResolvedValue({
      uid: CANCEL_ORDER_ID,
      kind: 'sell',
      sellAmount: '100',
      buyAmount: '200',
      executedSellAmount: '0',
      executedBuyAmount: '0',
      executedSellAmountBeforeFees: '0',
    })

    checkSolanaTransaction(buildMultisigCancellation('executed-cancel-signature'), params)

    await waitFor(() => expect(cancelOrdersBatch).toHaveBeenCalled())
  })

  it('releases the orders and says why when the cancellation proposal is rejected', async () => {
    const { params, cancelOrdersBatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      proposalOutcome: 'failed',
    })

    checkSolanaTransaction(buildMultisigCancellation('rejected-cancel-signature'), params)

    await waitFor(() =>
      expect(emitOnchainTransactionEvent).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Cancellation rejected in your multisig' }),
      ),
    )
    expect(cancelOrdersBatch).not.toHaveBeenCalled()
  })

  // The signature leaves the node's recent status cache after ~150 slots, so within a minute or two of
  // every send this is the path that runs. Returning success here retired the transaction before any
  // vote could be cast, which left the order creating forever however the members later voted.
  it('consults the proposal when the signature is only found in transaction history', async () => {
    const { params, dispatch, getSignatureStatuses } = createParams({
      status: null,
      blockHeight: LAST_VALID_BLOCK_HEIGHT + 1,
      historicalStatus: { slot: 99, confirmations: null, err: null, confirmationStatus: 'finalized' },
      proposalOutcome: 'failed',
    })

    checkSolanaTransaction(buildMultisigTransaction('aged-out-signature'), params)

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith(FAILED_ORDER))

    expect(getSignatureStatuses).toHaveBeenLastCalledWith(['aged-out-signature'], {
      searchTransactionHistory: true,
    })
  })

  // "Order Failed" alone leaves the user guessing; the members rejecting it is something we know.
  it('says the multisig rejected it, rather than a bare placement failure', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      proposalOutcome: 'failed',
    })

    checkSolanaTransaction(buildMultisigTransaction('rejected-message-signature'), params)

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith(FAILED_ORDER))

    expect(emitOnchainTransactionEvent).toHaveBeenCalledWith(
      expect.objectContaining({ summary: 'Order rejected in your multisig' }),
    )
  })

  it('keeps an aged-out signature pending while its proposal is still awaiting votes', async () => {
    const { params, dispatch } = createParams({
      status: null,
      blockHeight: LAST_VALID_BLOCK_HEIGHT + 1,
      historicalStatus: { slot: 99, confirmations: null, err: null, confirmationStatus: 'finalized' },
      proposalOutcome: 'unresolved',
    })

    checkSolanaTransaction(buildMultisigTransaction('aged-out-pending-signature'), params)

    await waitFor(() => expect(dispatch).toHaveBeenCalled())

    expect(dispatch).not.toHaveBeenCalledWith(FAILED_ORDER)
    expect(dispatch.mock.calls.flat().some((action) => action?.type === finalizeTransaction.type)).toBe(false)
  })

  // A multisig never broadcasts the transaction it is handed, so a confirmed signature only proves the
  // proposal was filed. Taking it as success marks the transaction done while the order is never placed.
  it('fails the order once the members reject the proposal', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      proposalOutcome: 'failed',
    })

    checkSolanaTransaction(buildMultisigTransaction('rejected-proposal-signature'), params)

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith(FAILED_ORDER))
  })

  it('keeps polling while the proposal is still awaiting votes', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      proposalOutcome: 'unresolved',
    })

    checkSolanaTransaction(buildMultisigTransaction('active-proposal-signature'), params)

    await waitFor(() => expect(dispatch).toHaveBeenCalled())

    expect(dispatch).not.toHaveBeenCalledWith(FAILED_ORDER)
    expect(dispatch.mock.calls.flat().some((action) => action?.type === finalizeTransaction.type)).toBe(false)
  })

  it('finalizes as successful once the proposal is executed', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
      proposalOutcome: 'executed',
    })

    checkSolanaTransaction(buildMultisigTransaction('executed-proposal-signature'), params)

    await waitFor(() =>
      expect(dispatch.mock.calls.flat().some((action) => action?.type === finalizeTransaction.type)).toBe(true),
    )
    expect(dispatch).not.toHaveBeenCalledWith(FAILED_ORDER)
  })

  // The gate: an ordinary keypair owner must never pay for a proposal lookup, nor have one applied.
  it('does not look up a proposal for an ordinary keypair owner', async () => {
    const { params, dispatch } = createParams({
      status: { slot: 42, confirmations: 1, err: null, confirmationStatus: 'confirmed' },
    })
    const keypairOrderCreation = {
      ...createTransaction(),
      hash: 'keypair-owner-signature',
      solanaOrderCreation: { orderId: ORDER_ID },
    } as EnhancedTransactionDetails

    checkSolanaTransaction(keypairOrderCreation, params)

    await waitFor(() => expect(dispatch).toHaveBeenCalled())

    expect(params.solanaConnection?.getTransaction).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalledWith(FAILED_ORDER)
  })
})
