import { updateSafeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { checkOnChainTransaction } from './checkOnChainTransaction'
import { finalizeEthereumTransaction } from './finalizeEthereumTransaction'
import { handleTransactionReplacement } from './handleTransactionReplacement'

import { CheckEthereumTransactions } from '../types'

const SAFE_TX_NOT_FOUND_ERROR = 'No MultisigTransaction matches the given query'

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

      if (typeof safeNonce === 'number' && safeNonce > safeTransaction.nonce && !isExecuted) {
        handleTransactionReplacement(transaction, params)

        return
      }

      // If the safe transaction is executed, but we don't have a tx receipt yet
      if (isExecuted && !receipt) {
        // Get the ethereum tx receipt
        console.log(
          '[FinalizeTxUpdater] Safe transaction is executed, but we have not fetched the receipt yet. Tx: ',
          transactionHash
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
      /**
       * There is an exceptional behavior for Safes with 1/1 signers and immediate execution.
       * In this case, Safe via WC returns on-chain tx hash instead of Safe tx hash.
       * So, we fallback to check the on-chain transaction.
       */
      if (error.message?.includes(SAFE_TX_NOT_FOUND_ERROR)) {
        checkOnChainTransaction(transaction, params)
      }

      if (!error.isCancelledError) {
        console.error(`[FinalizeTxUpdater] Failed to check transaction hash: ${hash}`, error)
      }
    })

  return cancel
}
