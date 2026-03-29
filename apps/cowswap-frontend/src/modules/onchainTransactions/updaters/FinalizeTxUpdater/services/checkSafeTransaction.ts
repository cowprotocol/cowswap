import { updateSafeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'

import { checkOnChainTransaction } from './checkOnChainTransaction'
import { finalizeEthereumTransaction } from './finalizeEthereumTransaction'
import { handleTransactionReplacement } from './handleTransactionReplacement'

import { CheckEthereumTransactions } from '../types'

/**
 * How long to wait before considering a Safe transaction as "dropped" if the Safe Transaction
 * Service can't find it. This handles cases where:
 * - User rejected the transaction in the Safe wallet
 * - Transaction was never actually submitted
 * - Safe Transaction Service is having issues
 */
const SAFE_TX_NOT_FOUND_TIMEOUT_MS = 2 * 60 * 1000 // 2 minutes

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function checkSafeTransaction(transaction: EnhancedTransactionDetails, params: CheckEthereumTransactions) {
  const { chainId, getTxSafeInfo, dispatch, safeInfo, getReceipt, lastBlockNumber } = params
  const { hash, receipt } = transaction
  // Get safe info and receipt
  const { promise: safeTransactionPromise, cancel } = getTxSafeInfo(hash)

  // Get safe info
  safeTransactionPromise
    .then(async (safeTransaction) => {
      const { isExecuted, transactionHash } = safeTransaction
      const safeNonce = safeInfo?.nonce

      if (typeof safeNonce === 'number' && BigInt(safeNonce) > BigInt(safeTransaction.nonce) && !isExecuted) {
        handleTransactionReplacement(transaction, params)

        return
      }

      // If the safe transaction is executed, but we don't have a tx receipt yet
      if (isExecuted && transactionHash && !receipt) {
        // Get the ethereum tx receipt
        console.log(
          '[FinalizeTxUpdater] Safe transaction is executed, but we have not fetched the receipt yet. Tx: ',
          transactionHash,
        )
        // Get the transaction receipt
        const { promise: receiptPromise } = getReceipt(transactionHash)

        receiptPromise
          .then((newReceipt) => finalizeEthereumTransaction(newReceipt, transaction, params, hash))
          .catch((error) => {
            if (!error.isCancelledError) {
              console.error(`[FinalizeTxUpdater] Failed to get transaction receipt for safeTransaction: ${hash}`, error)
            }
          })
      }

      dispatch(updateSafeTransaction({ chainId, safeTransaction, blockNumber: lastBlockNumber }))
    })
    .catch((error) => {
      if (error.isCancelledError) {
        return
      }

      /**
       * When the Safe Transaction Service fails to find a transaction, the approach depends
       * on whether the hash is a Safe tx hash or an Ethereum tx hash:
       *
       * 1. For GNOSIS_SAFE_TX (safeTxHash): The hash is a Safe-specific identifier that won't
       *    exist on-chain. If we can't find it after a timeout, the user likely rejected it.
       *
       * 2. For ETHEREUM_TX: This can happen for 1/1 signers with immediate execution where
       *    the Safe returns an on-chain tx hash. We should try to find it on-chain.
       */
      const isGnosisSafeTx = transaction.hashType !== HashType.ETHEREUM_TX
      const transactionAge = Date.now() - transaction.addedTime

      if (isGnosisSafeTx) {
        if (transactionAge > SAFE_TX_NOT_FOUND_TIMEOUT_MS) {
          handleTransactionReplacement(transaction, params)
        }
      } else {
        checkOnChainTransaction(transaction, params)
      }
    })

  return cancel
}
