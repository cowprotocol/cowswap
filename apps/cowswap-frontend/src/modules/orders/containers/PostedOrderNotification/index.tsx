import { ReactNode } from 'react'

import { ToastMessageType } from '@cowprotocol/events'

import { OnPostedOrderPayload } from '../../events/events'
import { OrderNotificationInfo } from '../../types'
import { OrderNotification } from '../OrderNotification'

interface PostedOrderNotificationProps {
  title: string
  messageType: ToastMessageType
  payload: OnPostedOrderPayload
}

export function PostedOrderNotification({ title, messageType, payload }: PostedOrderNotificationProps): ReactNode {
  return (
    <OrderNotification
      title={title}
      messageType={messageType}
      chainId={payload.orderDetails.chainId}
      orderUid={payload.orderDetails.orderUid}
      orderInfo={mapOrderNotificationInfo(payload)}
    />
  )
}

function mapOrderNotificationInfo({
  inputAmount,
  outputAmount,
  orderDetails,
}: OnPostedOrderPayload): OrderNotificationInfo {
  return {
    inputAmount: inputAmount,
    outputAmount: outputAmount,
    orderUid: orderDetails.orderUid,
    orderType: orderDetails.orderType,
    kind: orderDetails.kind,
    isEthFlowOrder: orderDetails.isEthFlow ?? false,
    owner: orderDetails.owner,
    receiver: orderDetails.receiver,
  }
}
