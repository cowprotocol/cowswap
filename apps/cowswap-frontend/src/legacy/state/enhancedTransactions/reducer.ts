import { OrderClass } from '@cowprotocol/cow-sdk'
import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'

import { createReducer } from '@reduxjs/toolkit'

import {
  addTransaction,
  clearAllTransactions,
  checkedTransaction,
  finalizeTransaction,
  replaceTransaction,
  updateSafeTransaction,
  ReplacementType,
  SerializableTransactionReceipt,
} from './actions'

export enum HashType {
  ETHEREUM_TX = 'ETHEREUM_TX',
  GNOSIS_SAFE_TX = 'GNOSIS_SAFE_TX',
}

export interface EnhancedTransactionDetails {
  hash: string // The hash of the transaction, normally Ethereum one, but not necessarily
  hashType: HashType // Transaction hash: could be Ethereum tx, or for multisigs could be some kind of hash identifying the order (i.e. Gnosis Safe)
  transactionHash?: string // Transaction hash. For EOA this field is immediately available, however, other wallets go through a process of offchain signing before the transactionHash is available
  nonce: number

  // Params using for polling handling
  addedTime: number // Used to determine the polling frequency
  lastCheckedBlockNumber?: number

  // Basic data
  from: string
  summary?: string
  confirmedTime?: number
  receipt?: SerializableTransactionReceipt // Ethereum transaction receipt
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any // any attached data type

  // Operations
  approval?: {
    tokenAddress: string
    spender: string
    // Hex string
    amount: string
  }
  presign?: { orderId: string }
  claim?: { recipient: string; cowAmountRaw?: string; indices: number[] }
  swapVCow?: boolean
  swapLockedGNOvCow?: boolean
  ethFlow?: { orderId: string; subType: 'creation' | 'cancellation' | 'refund' }
  onChainCancellation?: { orderId: string; sellTokenSymbol: string }
  // Wallet specific
  safeTransaction?: SafeMultisigTransactionResponse // Gnosis Safe transaction info

  // Cancelling/Replacing
  replacementType?: ReplacementType // if the user cancelled or speedup the tx it will be reflected here
  linkedTransactionHash?: string

  // Error
  errorMessage?: string

  class?: OrderClass // Flag to distinguish order class
}

export interface EnhancedTransactionState {
  [chainId: number]: {
    [txHash: string]: EnhancedTransactionDetails
  }
}

export const initialState: EnhancedTransactionState = {}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const now = () => new Date().getTime()

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function updateBlockNumber(tx: EnhancedTransactionDetails, blockNumber: number) {
  if (!tx.lastCheckedBlockNumber) {
    tx.lastCheckedBlockNumber = blockNumber
  } else {
    tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
  }
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      addTransaction,
      (
        transactions,
        {
          payload: {
            chainId,
            from,
            hash,
            hashType,
            nonce,
            approval,
            summary,
            presign,
            safeTransaction,
            claim,
            data,
            swapVCow,
            swapLockedGNOvCow,
            ethFlow,
            onChainCancellation,
          },
        },
      ) => {
        if (transactions[chainId]?.[hash]) {
          console.warn('[state::enhancedTransactions] Attempted to add existing transaction', hash)
          // Unknown transaction. Do nothing!
          return
        }
        const txs = transactions[chainId] ?? {}
        txs[hash] = {
          hash,
          transactionHash: hashType === HashType.ETHEREUM_TX ? hash : undefined,
          nonce,
          hashType,
          addedTime: now(),
          from,
          summary,
          data,

          // Operations
          approval,
          presign,
          safeTransaction,
          claim,
          swapVCow,
          swapLockedGNOvCow,
          ethFlow,
          onChainCancellation,
        }
        transactions[chainId] = txs
      },
    )

    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })

    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      updateBlockNumber(tx, blockNumber)
    })

    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()

      if (tx.linkedTransactionHash) {
        delete transactions[chainId]?.[tx.linkedTransactionHash]
      }
    })

    .addCase(replaceTransaction, (transactions, { payload: { chainId, oldHash, newHash, type } }) => {
      const allTxs = transactions[chainId] ?? {}
      if (!allTxs[oldHash]) {
        console.warn('[replaceTransaction] Attempted to replace an unknown transaction.', {
          chainId,
          oldHash,
          newHash,
        })
        return
      }

      const newTx = allTxs[newHash]

      if (newTx?.replacementType === type || newTx?.linkedTransactionHash) {
        console.warn('[replaceTransaction] The new replacement hash was already added.', {
          chainId,
          oldHash,
          newHash,
          type,
        })
        return
      }

      allTxs[newHash] = {
        ...allTxs[oldHash],
        hash: newHash,
        transactionHash: newHash,
        addedTime: new Date().getTime(),
        replacementType: type,
        linkedTransactionHash: oldHash,
      }

      console.warn('[replaceTransaction] Transaction replaced', allTxs[newHash])

      allTxs[oldHash].linkedTransactionHash = newHash
    })

    .addCase(updateSafeTransaction, (transactions, { payload: { chainId, safeTransaction, blockNumber } }) => {
      const { safeTxHash, transactionHash } = safeTransaction
      const tx = transactions[chainId]?.[safeTxHash]
      if (!tx) {
        console.warn('[updateSafeTransaction] Unknown safe transaction', safeTxHash)
        return
      }

      // Update block number
      updateBlockNumber(tx, blockNumber)

      // Update tx hash (if present)
      tx.transactionHash = transactionHash

      // Update safe info
      tx.safeTransaction = safeTransaction
    }),
)
