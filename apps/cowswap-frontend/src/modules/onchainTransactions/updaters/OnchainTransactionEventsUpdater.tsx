import { useEffect } from 'react'

import {
  CowEventListener,
  CowEvents,
  OnToastMessagePayload,
  OnTransactionPayload,
  ToastMessageType,
} from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { EVENT_EMITTER } from 'eventEmitter'

import { TransactionContentWithLink } from 'modules/orders'
import { getCowSoundError } from 'modules/sounds'

export function OnchainTransactionEventsUpdater() {
  const addSnackbar = useAddSnackbar()

  useEffect(() => {
    const listener: CowEventListener<CowEvents> = {
      event: CowEvents.ON_ONCHAIN_TRANSACTION,
      handler(payload: OnTransactionPayload) {
        const { receipt, summary } = payload
        const isSuccess = receipt.status === 1 && receipt.replacementType !== 'cancel'

        // Display a snackbar in CowSwap UI
        addSnackbar({
          content: (
            <TransactionContentWithLink transactionHash={receipt.transactionHash}>
              <>{summary}</>
            </TransactionContentWithLink>
          ),
          id: receipt.transactionHash,
          icon: isSuccess ? 'success' : 'alert',
        })

        // Emit a toast message
        EVENT_EMITTER.emit(CowEvents.ON_TOAST_MESSAGE, {
          messageType: isSuccess
            ? ToastMessageType.ONCHAIN_TRANSACTION_MINED
            : ToastMessageType.ONCHAIN_TRANSACTION_FAILED,
          message: summary,
          data: {
            transactionHash: receipt.transactionHash,
          },
        } as OnToastMessagePayload)

        // Play sound if transaction failed
        if (!isSuccess) {
          getCowSoundError().play()
        }
      },
    }

    EVENT_EMITTER.on(listener)

    return () => {
      EVENT_EMITTER.off(listener)
    }
  }, [addSnackbar])

  return null
}
