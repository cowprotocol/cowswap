import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents, OnchainTxEventPayloadMap } from 'modules/onchainTransactions'

export function processTwapCancellation(txHash: string, onTxSuccess: () => void): void {
  const onTxMined = (data: OnchainTxEventPayloadMap[OnchainTxEvents.BEFORE_TX_FINALIZE]): void => {
    if (data.transaction.hash === txHash) {
      ONCHAIN_TRANSACTIONS_EVENTS.off(listener)

      if (data.receipt.status === 'success') {
        onTxSuccess()
      }
    }
  }

  const listener = {
    event: OnchainTxEvents.BEFORE_TX_FINALIZE,
    handler: onTxMined,
  }

  ONCHAIN_TRANSACTIONS_EVENTS.on(listener)
}
