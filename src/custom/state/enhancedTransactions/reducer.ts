import { AnyAction, createReducer } from '@reduxjs/toolkit'
import transactionsReducer, { initialState, TransactionState } from 'state/transactions/reducer'
import { cancelTransaction, replaceTransaction } from 'state/enhancedTransactions/actions'

export const reducer = createReducer(initialState, (builder) =>
  builder
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
      const txs = transactions[chainId] ?? {}
      txs[newHash] = { ...txs[oldHash], hash: newHash, addedTime: new Date().getTime() }
      delete txs[oldHash]
    })
)

export default (state: TransactionState | undefined, action: AnyAction) => {
  const currentState = transactionsReducer(state, action)

  return reducer(currentState, action)
}
