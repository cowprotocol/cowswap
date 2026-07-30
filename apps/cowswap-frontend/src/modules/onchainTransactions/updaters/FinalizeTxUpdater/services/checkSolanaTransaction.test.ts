import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { waitFor } from '@testing-library/react'

import { checkedTransaction, finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'

import { checkSolanaTransaction } from './checkSolanaTransaction'

import { CheckEthereumTransactions } from '../types'

import type { Connection, SignatureStatus } from '@solana/web3.js'

const SIGNATURE = '5x8VXqZ8pQ2mJ7Yb1kL3nR4tW6uH9dF2sG5cA7eB1vN3mK4pQ8rT2yU6iO9aS1dF'
const ACCOUNT = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
const LAST_VALID_BLOCK_HEIGHT = 1_000

const transaction = {
  hash: SIGNATURE,
  transactionHash: SIGNATURE,
  hashType: HashType.SOLANA_TX,
  nonce: 0,
  addedTime: Date.now(),
  from: ACCOUNT,
  summary: 'Wrap 1 SOL to WSOL',
  data: { lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT },
} as EnhancedTransactionDetails

function createParams({
  status,
  blockHeight = LAST_VALID_BLOCK_HEIGHT - 1,
}: {
  status: SignatureStatus | null
  blockHeight?: number
}): { params: CheckEthereumTransactions; dispatch: jest.Mock } {
  const dispatch = jest.fn()

  const solanaConnection = {
    getSignatureStatuses: jest.fn().mockResolvedValue({ context: { slot: 42 }, value: [status] }),
    getBlockHeight: jest.fn().mockResolvedValue(blockHeight),
  } as unknown as Connection

  return {
    dispatch,
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

  it('finalizes as reverted once the blockhash has expired and the signature never landed', async () => {
    const { params, dispatch } = createParams({ status: null, blockHeight: LAST_VALID_BLOCK_HEIGHT + 1 })

    checkSolanaTransaction(transaction, params)

    await waitFor(() => expect(dispatch).toHaveBeenCalled())

    expect(dispatch.mock.calls[0][0].payload.receipt.status).toBe('reverted')
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
