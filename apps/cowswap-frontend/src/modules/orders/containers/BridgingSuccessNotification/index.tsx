import { ReactNode } from 'react'

import { OnBridgingSuccessPayload, ToastMessageType } from '@cowprotocol/events'
import { ExternalLink } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { useBridgeOrderData } from 'entities/bridgeOrders'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrderNotification } from '../OrderNotification'
import { mapBridgingResultToOrderInfo } from '../OrderNotification/utils'

interface BridgingSuccessNotificationProps {
  payload: OnBridgingSuccessPayload
}
export function BridgingSuccessNotification({ payload }: BridgingSuccessNotificationProps): ReactNode {
  const { chainId, order } = payload
  const bridgingOrder = useBridgeOrderData(order.uid)

  if (!bridgingOrder) return null

  const orderInfo = mapBridgingResultToOrderInfo(payload, bridgingOrder)

  return (
    <OrderNotification
      title="Bridging succeeded"
      actionTitle="Bridge"
      skipExplorerLink
      chainId={chainId}
      orderInfo={orderInfo}
      orderType={getUiOrderType(order)}
      orderUid={order.uid}
      receiver={bridgingOrder.recipient}
      messageType={ToastMessageType.ORDER_FULFILLED}
      bottomContent={
        payload.explorerUrl ? (
          <div>
            <br />
            <ExternalLink href={payload.explorerUrl}>
              <Trans>View on Bridge Explorer ↗</Trans>
            </ExternalLink>
          </div>
        ) : null
      }
    />
  )
}
