import { useEffect } from 'react'

import {
  CowWidgetEventListener,
  CowWidgetEvents,
  OnToastMessagePayload,
  OnTransactionPayload,
  ToastMessageType,
} from '@cowprotocol/events'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { TransactionContentWithLink } from 'modules/orders'
import { getCowSoundError } from 'modules/sounds'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OnchainTransactionEventsUpdater() {
  const addSnackbar = useAddSnackbar()

  useEffect(() => {
    const listener: CowWidgetEventListener = {
      event: CowWidgetEvents.ON_ONCHAIN_TRANSACTION,
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
        WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_TOAST_MESSAGE, {
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

    WIDGET_EVENT_EMITTER.on(listener)

    return () => {
      WIDGET_EVENT_EMITTER.off(listener)
    }
  }, [addSnackbar])

  return null
}
