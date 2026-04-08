import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents, OnchainTxEventPayloadMap } from 'modules/onchainTransactions'

export function processTwapCancellation(txHash: string, onTxSuccess: () => void, onTxFailed?: () => void): void {
  const onTxMined = (data: OnchainTxEventPayloadMap[OnchainTxEvents.BEFORE_TX_FINALIZE]): void => {
    if (data.transaction.hash === txHash) {
      cleanup()

      if (data.receipt.status === 'success') {
        onTxSuccess()
      } else {
        onTxFailed?.()
      }
    }
  }

  const onTxReplaced = (data: OnchainTxEventPayloadMap[OnchainTxEvents.TX_REPLACED]): void => {
    if (data.transaction.hash === txHash) {
      cleanup()
      onTxFailed?.()
    }
  }

  const finalizeListener = {
    event: OnchainTxEvents.BEFORE_TX_FINALIZE as const,
    handler: onTxMined,
  }

  const replacedListener = {
    event: OnchainTxEvents.TX_REPLACED as const,
    handler: onTxReplaced,
  }

  const cleanup = (): void => {
    ONCHAIN_TRANSACTIONS_EVENTS.off(finalizeListener)
    ONCHAIN_TRANSACTIONS_EVENTS.off(replacedListener)
  }

  ONCHAIN_TRANSACTIONS_EVENTS.on(finalizeListener)
  ONCHAIN_TRANSACTIONS_EVENTS.on(replacedListener)
}
