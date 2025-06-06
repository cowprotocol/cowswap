import { useEffect } from 'react'

import { useAllTransactionsDetails } from 'legacy/state/enhancedTransactions/hooks'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import { usePendingTransactionsContext } from './hooks/usePendingTransactionsContext'
import { useShouldCheckPendingTx } from './hooks/useShouldCheckPendingTx'
import { checkOnChainTransaction } from './services/checkOnChainTransaction'
import { checkSafeTransaction } from './services/checkSafeTransaction'

import { OnchainTransactionEventsUpdater } from '../OnchainTransactionEventsUpdater'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FinalizeTxUpdater() {
  // Get, from the pending transaction, the ones that we should re-check
  const shouldCheckFilter = useShouldCheckPendingTx()

  const transactions = useAllTransactionsDetails(shouldCheckFilter)

  const params = usePendingTransactionsContext()

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
