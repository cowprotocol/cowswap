import { createReducer } from '@reduxjs/toolkit'
import {
  addTransaction,
  clearAllTransactions,
  checkedTransaction,
  finalizeTransaction,
  replaceTransaction,
  updateSafeTransaction,
  ReplacementType,
} from 'state/enhancedTransactions/actions'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { SerializableTransactionReceipt } from '@src/state/transactions/actions'

export enum HashType {
  ETHEREUM_TX = 'ETHEREUM_TX',
  GNOSIS_SAFE_TX = 'GNOSIS_SAFE_TX',
}

export interface EnhancedTransactionDetails {
  hash: string // The hash of the transaction, normally Ethereum one, but not necessarily
  hashType: HashType // Transaction hash: could be Ethereum tx, or for multisigs could be some kind of hash identifying the order (i.e. Gnosis Safe)
  transactionHash?: string // Transaction hash. For EOA this field is immediately available, however, other wallets go through a process of offchain signing before the transactionHash is available

  // Params using for polling handling
  addedTime: number // Used to determine the polling frequency
  lastCheckedBlockNumber?: number

  // Basic data
  from: string
  summary?: string
  confirmedTime?: number
  receipt?: SerializableTransactionReceipt // Ethereum transaction receipt
  data?: any // any attached data type

  // Operations
  approval?: { tokenAddress: string; spender: string }
  presign?: { orderId: string }
  claim?: { recipient: string; cowAmountRaw?: string; indices: number[] }
  swapVCow?: boolean
  swapLockedGNOvCow?: boolean

  // Wallet specific
  safeTransaction?: SafeMultisigTransactionResponse // Gnosis Safe transaction info

  // Cancelling/Replacing
  replacementType?: ReplacementType // if the user cancelled or speedup the tx it will be reflected here
  linkedTransactionHash?: string
}

export interface EnhancedTransactionState {
  [chainId: number]: {
    [txHash: string]: EnhancedTransactionDetails
  }
}

export const initialState: EnhancedTransactionState = {}

const now = () => new Date().getTime()

function updateBlockNumber(tx: EnhancedTransactionDetails, blockNumber: number) {
  if (!tx.lastCheckedBlockNumber) {
    tx.lastCheckedBlockNumber = blockNumber
  } else {
    tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
  }
}

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
            approval,
            summary,
            presign,
            safeTransaction,
            claim,
            data,
            swapVCow,
            swapLockedGNOvCow,
          },
        }
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
        }
        transactions[chainId] = txs
      }
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
        console.error('Attempted to replace an unknown transaction.')
        return
      }

      if (allTxs[newHash]) {
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
    })
)
