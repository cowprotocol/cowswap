import { useCallback } from 'react'

import { isCowOrder } from '@cowprotocol/common-utils'
import { OnPostedOrderPayload } from '@cowprotocol/events'
import { TokenInfo } from '@cowprotocol/types'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useOrder } from 'legacy/state/orders/hooks'

import { getUiOrderType, ORDER_UI_TYPE_TITLES } from 'utils/orderUtils/getUiOrderType'

import { OrderLinkWrapper } from '../../pure/commonStyled'
import { OrderSummary } from '../../pure/OrderSummary'
import { ReceiverInfo } from '../../pure/ReceiverInfo'

export interface PendingOrderNotificationProps {
  payload: OnPostedOrderPayload
  onToastMessage(message: string): void
}

export function PendingOrderNotification(props: PendingOrderNotificationProps) {
  const isSafeWallet = useIsSafeWallet()

  const { payload, onToastMessage } = props

  const { orderUid, chainId, orderCreationHash } = payload

  const order = useOrder({ chainId, id: orderUid })

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node) onToastMessage(node.innerText)
    },
    [onToastMessage]
  )

  if (!order) return null

  const { owner, receiver } = order

  const orderType = getUiOrderType(order)

  const tx = {
    hash: orderCreationHash || orderUid,
    hashType:
      isSafeWallet && !isCowOrder('transaction', orderCreationHash) ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: orderCreationHash || '',
      safe: owner,
    },
  }

  return (
    <>
      <div ref={ref}>
        <strong>{ORDER_UI_TYPE_TITLES[orderType]} submitted</strong>
        <br />
        <OrderSummary
          kind={order.kind}
          inputToken={order.inputToken as TokenInfo}
          outputToken={order.outputToken as TokenInfo}
          sellAmount={order.sellAmount}
          buyAmount={order.buyAmount}
        />
        <ReceiverInfo receiver={receiver} owner={owner} />
      </div>
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
