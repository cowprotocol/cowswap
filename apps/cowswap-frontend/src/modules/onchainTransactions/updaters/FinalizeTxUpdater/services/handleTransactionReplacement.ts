import { replaceTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { partialOrderUpdate } from 'legacy/state/orders/utils'

import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents } from '../../../onchainTransactionsEvents'
import { CheckEthereumTransactions } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function handleTransactionReplacement(
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions,
) {
  const { chainId, dispatch, isSafeWallet } = params
  const { hash } = transaction

  console.log('[FinalizeTxUpdater] Transaction is outdated, moving it to "replaced" state.', { hash })

  // Emit event before replacing so listeners can react (e.g., clearing TWAP cancellation status)
  ONCHAIN_TRANSACTIONS_EVENTS.emit(OnchainTxEvents.TX_REPLACED, { transaction })

  // If this was a cancellation transaction, clear the order's cancelling state
  if (transaction.onChainCancellation) {
    const { orderId } = transaction.onChainCancellation
    partialOrderUpdate(
      { chainId, order: { id: orderId, isCancelling: false, cancellationHash: undefined }, isSafeWallet },
      dispatch,
    )
  }

  dispatch(replaceTransaction({ chainId, oldHash: hash, newHash: hash, type: 'replaced' }))
}
