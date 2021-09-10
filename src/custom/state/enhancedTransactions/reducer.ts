import { createReducer } from '@reduxjs/toolkit'
import {
  addTransaction,
  clearAllTransactions,
  checkedTransaction,
  finalizeTransaction,
  cancelTransaction,
  replaceTransaction,
  updateSafeTransactions,
} from 'state/enhancedTransactions/actions'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { SerializableTransactionReceipt } from '@src/state/transactions/actions'

export enum HashType {
  ETHEREUM_TX,
  GNOSIS_SAFE_TX,
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

  // Operations
  approval?: { tokenAddress: string; spender: string }
  presign?: { orderId: string }

  // Wallet specific
  safeTransaction?: SafeMultisigTransactionResponse // Gnosis Safe transaction info
}

export interface EnhancedTransactionState {
  [chainId: number]: {
    [txHash: string]: EnhancedTransactionDetails
  }
}

export const initialState: EnhancedTransactionState = {}

const now = () => new Date().getTime()

export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      addTransaction,
      (transactions, { payload: { chainId, from, hash, hashType, approval, summary, presign, safeTransaction } }) => {
        if (transactions[chainId]?.[hash]) {
          throw Error('Attempted to add existing transaction.')
        }
        const txs = transactions[chainId] ?? {}
        txs[hash] = {
          hash,
          hashType,
          addedTime: now(),
          from,
          summary,

          // Operations
          approval,
          presign,
          safeTransaction,
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
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })

    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })

    .addCase(cancelTransaction, (transactions, { payload: { chainId, hash } }) => {
      if (!transactions[chainId]?.[hash]) {
        console.error('Attempted to cancel an unknown transaction.')
        return
      }
      const allTxs = transactions[chainId] ?? {}
      delete allTxs[hash]
    })

    .addCase(replaceTransaction, (transactions, { payload: { chainId, oldHash, newHash } }) => {
      if (!transactions[chainId]?.[oldHash]) {
        console.error('Attempted to replace an unknown transaction.')
        return
      }
      const allTxs = transactions[chainId] ?? {}
      allTxs[newHash] = { ...allTxs[oldHash], hash: newHash, addedTime: new Date().getTime() }
      delete allTxs[oldHash]
    })

    .addCase(updateSafeTransactions, (transactions, { payload: { chainId, safeTransactions } }) => {
      const allTxs = transactions[chainId] ?? {}

      for (const safeTransaction of safeTransactions) {
        const { safeTxHash } = safeTransaction
        const tx = allTxs[safeTxHash]
        if (!tx) {
          console.error('Attempted to updateSafeTransactions for an unknown transaction')
          continue
        }

        allTxs[safeTxHash].safeTransaction = safeTransaction
      }
    })
)
