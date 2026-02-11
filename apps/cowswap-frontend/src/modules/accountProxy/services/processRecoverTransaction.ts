import { RefObject } from 'react'

import { Command } from '@cowprotocol/types'

import { ONCHAIN_TRANSACTIONS_EVENTS, OnchainTxEvents, OnchainTxEventPayloadMap } from 'modules/onchainTransactions'

export function processRecoverTransaction(
  txHash: string,
  destroyedRef: RefObject<boolean>,
  onTxFinished: Command,
  onTxSuccess: Command,
): void {
  const onTxMined = (data: OnchainTxEventPayloadMap[OnchainTxEvents.BEFORE_TX_FINALIZE]): void => {
    if (destroyedRef.current) {
      ONCHAIN_TRANSACTIONS_EVENTS.off(listener)
      return
    }

    if (data.transaction.hash === txHash) {
      ONCHAIN_TRANSACTIONS_EVENTS.off(listener)
      onTxFinished()

      // Go back to the proxy page when tx is mined
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
