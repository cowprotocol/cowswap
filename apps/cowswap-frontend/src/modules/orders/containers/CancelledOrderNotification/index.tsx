import { useCallback } from 'react'

import { shortenOrderId } from '@cowprotocol/common-utils'
import { OnCancelledOrderPayload } from '@cowprotocol/events'
import { TokenInfo } from '@cowprotocol/types'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useOrder } from 'legacy/state/orders/hooks'

import { OrderLinkWrapper } from '../../pure/commonStyled'
import { OrderSummary } from '../../pure/OrderSummary'
import { ReceiverInfo } from '../../pure/ReceiverInfo'

export interface PendingOrderNotificationProps {
  payload: OnCancelledOrderPayload
  onToastMessage(message: string): void
}

export function CancelledOrderNotification(props: PendingOrderNotificationProps) {
  const {
    payload: {
      chainId,
      order: { uid: orderUid },
      transactionHash,
    },
    onToastMessage,
  } = props

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node) onToastMessage(node.innerText)
    },
    [onToastMessage]
  )

  const order = useOrder({ chainId, id: orderUid })

  if (!order) return

  const tx = {
    hash: transactionHash || orderUid,
    hashType: HashType.ETHEREUM_TX,
  }

  // TODO: do we need this?
  // orderAnalytics('Canceled', getUiOrderType(payload.orderUid))

  return (
    <>
      <div ref={ref}>
        <strong>Order successfully cancelled</strong>
        <br />
        <p>
          Order <strong>{shortenOrderId(orderUid)}</strong>:
        </p>
        <OrderSummary
          kind={order.kind}
          inputToken={order.inputToken as TokenInfo}
          outputToken={order.outputToken as TokenInfo}
          sellAmount={order.sellAmount}
          buyAmount={order.buyAmount}
        />
        <ReceiverInfo receiver={order.receiver} owner={order.owner} />
      </div>
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
