import { ReactNode } from 'react'

import { OnBridgingSuccessPayload, ToastMessageType } from '@cowprotocol/events'
import { ExternalLink } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useBridgeOrderData } from 'entities/bridgeOrders'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { OrderNotification } from '../OrderNotification'
import { mapBridgingResultToOrderInfo } from '../OrderNotification/utils'

import type { OrderSummaryTemplateProps } from '../../pure/OrderSummary/summaryTemplates'

function summaryTemplate({
  inputAmount,
  outputAmount,
  srcChainData,
  dstChainData,
}: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      <Trans>Sell</Trans> {inputAmount}{' '}
      {srcChainData && (
        <>
          ({srcChainData.label}) <Trans>for a total of</Trans> {outputAmount}{' '}
          {dstChainData && <> ({dstChainData.label})</>}
        </>
      )}
    </>
  )
}

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
      title={<Trans>Bridging succeeded</Trans>}
      actionTitle={t`Bridge`}
      skipExplorerLink
      chainId={chainId}
      orderInfo={orderInfo}
      customTemplate={summaryTemplate}
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
