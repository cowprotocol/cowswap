import { CowWidgetEvents, OnToastMessagePayload, ToastMessagePayloads, ToastMessageType } from '@cowprotocol/events'

import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

export function getToastMessageCallback(
  messageType: ToastMessageType,
  data: ToastMessagePayloads[typeof messageType],
): (toastMessage: string) => void {
  return (toastMessage: string) => {
    const payload = {
      messageType,
      message: toastMessage,
      data,
    }

    WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_TOAST_MESSAGE, payload as OnToastMessagePayload)
  }
}
