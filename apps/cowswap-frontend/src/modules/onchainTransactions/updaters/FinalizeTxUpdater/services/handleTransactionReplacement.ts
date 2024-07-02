import { replaceTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { CheckEthereumTransactions } from '../types'

export function handleTransactionReplacement(
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions
) {
  const { chainId, dispatch } = params
  const { hash } = transaction

  console.log('[FinalizeTxUpdater] Transaction is outdated, moving it to "replaced" state.', { hash })

  dispatch(replaceTransaction({ chainId, oldHash: hash, newHash: hash, type: 'replaced' }))
}
