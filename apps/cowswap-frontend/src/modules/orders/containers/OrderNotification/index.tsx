import { ReactElement, useCallback, useMemo } from 'react'

import { shortenOrderId } from '@cowprotocol/common-utils'
import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ToastMessageType } from '@cowprotocol/events'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'

import { useOrder } from 'legacy/state/orders/hooks'

import {
  getToastMessageCallback,
  isEnrichedOrder,
  mapEnrichedOrderToInfo,
  mapStoreOrderToInfo,
  OrderInfo,
} from './utils'

import { OrderSummary } from '../../pure/OrderSummary'
import { ReceiverInfo } from '../../pure/ReceiverInfo'
import { TransactionContentWithLink } from '../TransactionContentWithLink'

export interface BaseOrderNotificationProps {
  title: ReactElement | string
  messageType: ToastMessageType
  chainId: SupportedChainId
  orderUid: string
  orderType: UiOrderType
  orderInfo?: OrderInfo | EnrichedOrder
  transactionHash?: string
  isEthFlow?: boolean
  children?: ReactElement
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderNotification(props: BaseOrderNotificationProps) {
  const { title, orderUid, orderType, transactionHash, chainId, messageType, children, orderInfo, isEthFlow } = props

  const allTokens = useTokensByAddressMap()

  const orderFromStore = useOrder({ chainId, id: orderInfo ? undefined : orderUid })

  const order = useMemo(() => {
    if (orderInfo) {
      return isEnrichedOrder(orderInfo) ? mapEnrichedOrderToInfo(orderInfo, allTokens) : orderInfo
    }

    return orderFromStore ? mapStoreOrderToInfo(orderFromStore) : undefined
  }, [orderFromStore, orderInfo, allTokens])

  const onToastMessage = useMemo(
    () =>
      getToastMessageCallback(messageType, {
        orderUid,
        orderType,
      }),
    [messageType, orderType, orderUid],
  )

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node) onToastMessage(node.innerText)
    },
    [onToastMessage],
  )

  if (!order) return

  return (
    <TransactionContentWithLink isEthFlow={isEthFlow} transactionHash={transactionHash} orderUid={orderUid}>
      <div ref={ref}>
        <strong>{title}</strong>
        <br />
        <p>
          Order <strong>{shortenOrderId(orderUid)}</strong>:
        </p>
        {children ||
          (order.inputToken && order.outputToken ? (
            <OrderSummary
              kind={order.kind}
              inputToken={order.inputToken as TokenInfo}
              outputToken={order.outputToken as TokenInfo}
              sellAmount={order.inputAmount.toString()}
              buyAmount={order.outputAmount.toString()}
            />
          ) : null)}
        <ReceiverInfo receiver={order.receiver} owner={order.owner} />
      </div>
    </TransactionContentWithLink>
  )
}
