import { useCallback } from 'react'

import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'

import { useTransactionAdder } from '../../../legacy/state/enhancedTransactions/hooks'
import { extensibleFallbackSetupTxs } from '../services/extensibleFallbackSetupTxs'

export function useSetupFallbackHandler(): () => Promise<string | undefined> {
  const sendBatchTransactions = useSendBatchTransactions()
  const extensibleFallbackContext = useExtensibleFallbackContext()
  const addTransaction = useTransactionAdder()

  return useCallback(async () => {
    if (!extensibleFallbackContext) return

    const fallbackSetupTxs = await extensibleFallbackSetupTxs(extensibleFallbackContext)
    const txHash = await sendBatchTransactions(fallbackSetupTxs)

    addTransaction({
      hash: txHash,
      summary: 'Setup TWAP fallback handler',
    })

    return txHash
  }, [extensibleFallbackContext, sendBatchTransactions, addTransaction])
}
