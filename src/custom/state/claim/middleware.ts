import { Middleware, isAnyOf } from '@reduxjs/toolkit'
import { AppState } from 'state'
import { finalizeTransaction } from '../enhancedTransactions/actions'

const isFinalizeTransaction = isAnyOf(finalizeTransaction)

// On each Pending, Expired, Fulfilled order action a corresponding sound is dispatched
export const claimMinedMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isFinalizeTransaction(action)) {
    const { chainId, hash, receipt, safeTransaction } = action.payload
    const transaction = store.getState().transactions[chainId][hash]

    console.log('[stat:claim:middleware] Transaction finalized', transaction, receipt, safeTransaction)
    if (transaction.claim) {
      // TODO: Update state
      console.log('[stat:claim:middleware] It is a CLAIM transaction')
    }
  }

  return result
}
