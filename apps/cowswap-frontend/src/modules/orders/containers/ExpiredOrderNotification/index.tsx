import { useCallback } from 'react'

import { OnExpiredOrderPayload } from '@cowprotocol/events'
import { TokenInfo } from '@cowprotocol/types'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useOrder } from 'legacy/state/orders/hooks'

import { OrderLinkWrapper } from '../../pure/commonStyled'
import { OrderSummary } from '../../pure/OrderSummary'

export interface ExpiredOrderNotificationProps {
  payload: OnExpiredOrderPayload
  onToastMessage(message: string): void
}

export function ExpiredOrderNotification(props: ExpiredOrderNotificationProps) {
  const {
    payload: {
      chainId,
      order: { uid: orderUid },
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
    hash: orderUid,
    hashType: HashType.ETHEREUM_TX,
  }

  // TODO: do we need this?
  // orderAnalytics('Expired', getUiOrderType(orderObject.order))

  return (
    <>
      <div ref={ref}>
        <OrderSummary
          kind={order.kind}
          inputToken={order.inputToken as TokenInfo}
          outputToken={order.outputToken as TokenInfo}
          sellAmount={order.sellAmount}
          buyAmount={order.buyAmount}
        >
          <> expired</>
        </OrderSummary>
      </div>
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
