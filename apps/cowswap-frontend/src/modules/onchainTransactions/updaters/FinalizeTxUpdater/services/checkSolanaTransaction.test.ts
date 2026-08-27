import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { waitFor } from '@testing-library/react'

import { checkedTransaction, finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'

import { checkSolanaTransaction, HISTORICAL_LOOKUP_GRACE_PERIOD_MS } from './checkSolanaTransaction'

import { CheckEthereumTransactions } from '../types'

import type { Connection, SignatureStatus } from '@solana/web3.js'

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
}): { params: CheckEthereumTransactions; dispatch: jest.Mock; getSignatureStatuses: jest.Mock } {
  const dispatch = jest.fn()

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
    params: {
      chainId: SupportedChainId.SOLANA,
      account: ACCOUNT,
      dispatch,
      solanaConnection,
      lastBlockNumber: 42,
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
})
