import { checkedTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { finalizeEthereumTransaction } from './finalizeEthereumTransaction'
import { handleTransactionReplacement } from './handleTransactionReplacement'

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

      if (!error.isCancelledError) {
        console.error(`[FinalizeTxUpdater] Failed to get transaction receipt for tx: ${hash}`, error)
      }

      if (transaction.nonce === undefined || transaction.nonce < transactionsCount) {
        handleTransactionReplacement(transaction, params)
      }
    })

  return cancel
}
