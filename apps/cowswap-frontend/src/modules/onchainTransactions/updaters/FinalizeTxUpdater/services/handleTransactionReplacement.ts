import { replaceTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { CheckEthereumTransactions } from '../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function handleTransactionReplacement(
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions
) {
  const { chainId, dispatch } = params
  const { hash } = transaction

  console.log('[FinalizeTxUpdater] Transaction is outdated, moving it to "replaced" state.', { hash })

  dispatch(replaceTransaction({ chainId, oldHash: hash, newHash: hash, type: 'replaced' }))
}
