import { useEffect } from 'react'

import { useAllTransactionsDetails } from 'legacy/state/enhancedTransactions/hooks'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import { useCheckEthereumTransactions } from './hooks/useCheckEthereumTransactions'
import { useShouldCheckPendingTx } from './hooks/useShouldCheckPendingTx'
import { checkOnChainTransaction } from './services/checkOnChainTransaction'
import { checkSafeTransaction } from './services/checkSafeTransaction'

import { OnchainTransactionEventsUpdater } from '../OnchainTransactionEventsUpdater'

export function FinalizeTxUpdater() {
  // Get, from the pending transaction, the ones that we should re-check
  const shouldCheckFilter = useShouldCheckPendingTx()

  const transactions = useAllTransactionsDetails(shouldCheckFilter)

  const params = useCheckEthereumTransactions()

  useEffect(() => {
    if (!params) return

    const promiseCancellations = transactions.map((transaction) => {
      if (transaction.hashType === HashType.GNOSIS_SAFE_TX) {
        return checkSafeTransaction(transaction, params)
      } else {
        return checkOnChainTransaction(transaction, params)
      }
    })

    return () => {
      // Cancel all promises
      promiseCancellations.forEach((cancel) => cancel())
    }
  }, [transactions, params])

  return <OnchainTransactionEventsUpdater />
}
