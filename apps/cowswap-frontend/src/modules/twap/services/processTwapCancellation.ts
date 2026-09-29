import { logTwap } from '@cowprotocol/common-utils'

import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents, OnchainTxEventPayloadMap } from 'modules/onchainTransactions'

export function processTwapCancellation(txHash: string, onTxSuccess: () => void): void {
  logTwap.debug('Tracking TWAP cancellation transaction', { txHash })

  const onTxMined = (data: OnchainTxEventPayloadMap[OnchainTxEvents.BEFORE_TX_FINALIZE]): void => {
    if (data.transaction.hash === txHash) {
      ONCHAIN_TRANSACTIONS_EVENTS.off(listener)

      if (data.receipt.status === 'success') {
        logTwap.info('TWAP cancellation transaction confirmed', { txHash })
        onTxSuccess()
      } else {
        logTwap.warn('TWAP cancellation transaction failed', {
          txHash,
          status: data.receipt.status,
        })
      }
    }
  }

  const listener = {
    event: OnchainTxEvents.BEFORE_TX_FINALIZE as const,
    handler: onTxMined,
  }

  ONCHAIN_TRANSACTIONS_EVENTS.on(listener)
}
