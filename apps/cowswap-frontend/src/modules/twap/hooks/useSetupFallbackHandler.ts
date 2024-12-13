import { useSafeAppsSdk } from '@cowprotocol/wallet'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'

import { useTransactionAdder } from '../../../legacy/state/enhancedTransactions/hooks'
import { extensibleFallbackSetupTxs } from '../services/extensibleFallbackSetupTxs'

export function useSetupFallbackHandler() {
  const safeAppsSdk = useSafeAppsSdk()
  const extensibleFallbackContext = useExtensibleFallbackContext()
  const addTransaction = useTransactionAdder()

  return async () => {
    if (!safeAppsSdk || !extensibleFallbackContext) return

    const fallbackSetupTxs = await extensibleFallbackSetupTxs(extensibleFallbackContext)
    const { safeTxHash } = await safeAppsSdk.txs.send({ txs: fallbackSetupTxs })

    addTransaction({
      hash: safeTxHash,
      summary: 'Setup TWAP fallback handler',
    })

    return safeTxHash
  }
}
