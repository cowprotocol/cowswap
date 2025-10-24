import { useCallback } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { RecoverFundsContext } from './useRecoverFundsFromProxy'

export function useRecoverFundsCallback(
  recoverFundsContext: RecoverFundsContext,
  handleSetError: (error: string | undefined) => void,
): () => Promise<string | undefined> {
  const addTransaction = useTransactionAdder()
  const { i18n } = useLingui()
  const accountProxyLabelString = i18n._(ACCOUNT_PROXY_LABEL)

  const { callback: recoverFundsCallback } = recoverFundsContext

  return useCallback(async () => {
    try {
      const txHash = await recoverFundsCallback()

      if (txHash) {
        addTransaction({ hash: txHash, summary: t`Recover funds from ${accountProxyLabelString}` })
      }

      return txHash
    } catch (e) {
      console.error(e)
      handleSetError(e.message || e.toString())
    }
    return
  }, [recoverFundsCallback, addTransaction, accountProxyLabelString, handleSetError])
}
