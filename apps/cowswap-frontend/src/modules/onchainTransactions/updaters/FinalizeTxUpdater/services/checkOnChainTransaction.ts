import { checkedTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { NOT_BROADCAST_GRACE_PERIOD_MS, TransactionNotBroadcastError } from 'common/hooks/useGetReceipt'

import { finalizeEthereumTransaction } from './finalizeEthereumTransaction'
import { handleTransactionReplacement } from './handleTransactionReplacement'

import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents } from '../../../onchainTransactionsEvents'
import { CheckEthereumTransactions } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function checkOnChainTransaction(transaction: EnhancedTransactionDetails, params: CheckEthereumTransactions) {
  const { chainId, transactionsCount, dispatch, getReceipt, lastBlockNumber } = params
  const { hash } = transaction

  // Update the last checked blockNumber
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const setTxLastBlockNumber = () => {
    dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
  }

  // Get receipt for transaction, and finalize if needed
  const { promise, cancel } = getReceipt(hash)

  promise
    .then((receipt) => {
      if (receipt) {
        // If the tx is mined. We finalize it!
        finalizeEthereumTransaction(receipt, transaction, params)
      } else {
        setTxLastBlockNumber()
      }
    })
    .catch((error) => {
      setTxLastBlockNumber()

      if (error instanceof TransactionNotBroadcastError) {
        // The hash doesn't exist on-chain or in the mempool — it was likely a MetaMask Smart
        // Transaction synthetic hash that was cancelled before the tx was ever broadcast.
        // Wait for the grace period before acting to allow for node propagation delays.
        const gracePeriodMs = NOT_BROADCAST_GRACE_PERIOD_MS[chainId]
        const pendingMs = Date.now() - transaction.addedTime
        if (pendingMs >= gracePeriodMs) {
          console.log('[FinalizeTxUpdater] Transaction not found on-chain after grace period, marking as replaced.', {
            hash,
          })
          ONCHAIN_TRANSACTIONS_EVENTS.emit(OnchainTxEvents.TX_CANCELLED_NOT_BROADCAST, { transaction })
          handleTransactionReplacement(transaction, params)
        }
        return
      }

      if (!error.isCancelledError && !error.isRetryableError) {
        console.error(`[FinalizeTxUpdater] Failed to get transaction receipt for tx: ${hash}`, error)
      }

      // Only mark as replaced when this tx's nonce is behind the chain (another tx with this nonce was mined).
      // Do not mark when nonce is undefined or when receipt fetch failed only because the tx is still pending.
      if (transaction.nonce !== undefined && transaction.nonce < transactionsCount) {
        handleTransactionReplacement(transaction, params)
      }
    })

  return cancel
}
