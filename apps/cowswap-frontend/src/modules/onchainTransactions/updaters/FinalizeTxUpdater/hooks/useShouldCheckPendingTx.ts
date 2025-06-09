import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { useBlockNumber } from 'common/hooks/useBlockNumber'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useShouldCheckPendingTx() {
  const { account } = useWalletInfo()

  const lastBlockNumber = useBlockNumber()
  const accountLowerCase = account?.toLowerCase() || ''

  return useCallback(
    (tx: EnhancedTransactionDetails) => shouldCheckPendingTx(lastBlockNumber, accountLowerCase, tx),
    [accountLowerCase, lastBlockNumber]
  )
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
function shouldCheckPendingTx(
  lastBlockNumber: number | undefined,
  accountLowerCase: string,
  tx: EnhancedTransactionDetails
): boolean {
  const isCurrentAccount = tx.from.toLowerCase() === accountLowerCase
  const isReplaced = !!(tx.replacementType || tx.linkedTransactionHash)
  const isTxMined = !!tx.receipt
  const isFailed = !!tx.errorMessage

  if (!isCurrentAccount || isReplaced || isTxMined || isFailed) return false

  // If a tx was never checked, we should check it
  if (!tx.lastCheckedBlockNumber) return true

  if (!lastBlockNumber) return false

  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false

  const minutesPending = (Date.now() - tx.addedTime) / 1000 / 60
  // every 3 blocks if pending for longer than 5 minutes
  if (minutesPending > 5) return blocksSinceCheck >= 3

  // every 2 blocks if pending more than 1 minute
  if (minutesPending > 1) return blocksSinceCheck >= 2

  // otherwise every block
  return true
}
