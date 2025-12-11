import { ReactNode, useCallback, useMemo } from 'react'

import { shortenOrderId } from '@cowprotocol/common-utils'
import { EnrichedOrder, SupportedChainId, getChainInfo } from '@cowprotocol/cow-sdk'
import { ToastMessageType } from '@cowprotocol/events'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'

import { Trans } from '@lingui/react/macro'
import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { useOrder } from 'legacy/state/orders/hooks'

import {
  getToastMessageCallback,
  isEnrichedOrder,
  mapEnrichedOrderToInfo,
  mapStoreOrderToInfo,
  OrderInfo,
} from './utils'

import { OrderSummary } from '../../pure/OrderSummary'
import { SellForAtLeastTemplate } from '../../pure/OrderSummary/summaryTemplates'
import { ReceiverInfo } from '../../pure/ReceiverInfo'
import { TransactionContentWithLink } from '../TransactionContentWithLink'

export interface BaseOrderNotificationProps {
  title: ReactNode
  messageType: ToastMessageType
  chainId: SupportedChainId
  orderUid: string
  orderType: UiOrderType
  actionTitle?: string
  orderInfo?: OrderInfo | EnrichedOrder
  transactionHash?: string
  skipExplorerLink?: boolean
  isEthFlow?: boolean
  children?: ReactNode
  bottomContent?: ReactNode
  receiver?: string
  hideReceiver?: boolean
  customTemplate?: typeof SellForAtLeastTemplate
}

export function OrderNotification(props: BaseOrderNotificationProps): ReactNode {
  const {
    title,
    actionTitle,
    orderUid,
    orderType,
    transactionHash,
    chainId,
    messageType,
    children,
    orderInfo,
    isEthFlow,
    skipExplorerLink,
    hideReceiver,
    receiver,
  } = props
  const allTokens = useTokensByAddressMap()

  const orderFromStore = useOrder({ chainId, id: orderInfo ? undefined : orderUid })

  const order = useMemo(() => {
    if (orderInfo) {
      return isEnrichedOrder(orderInfo) ? mapEnrichedOrderToInfo(orderInfo, allTokens) : orderInfo
    }

    return orderFromStore ? mapStoreOrderToInfo(orderFromStore) : undefined
  }, [orderFromStore, orderInfo, allTokens])

  const sourceChainId = order?.inputToken.chainId
  const srcChainData = sourceChainId ? getChainInfo(sourceChainId) : undefined
  const dstChainData = useBridgeSupportedNetwork(order?.outputToken.chainId)

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

  const content = (
    <div ref={ref}>
      <strong>{title}</strong>
      <br />
      <p>
        <Trans>Order</Trans> <strong>{shortenOrderId(orderUid)}</strong>:
      </p>
      {children ||
        (order.inputToken && order.outputToken ? (
          <OrderSummary
            actionTitle={actionTitle}
            buyAmount={order.outputAmount.toString()}
            customTemplate={props.customTemplate}
            dstChainData={dstChainData}
            inputToken={order.inputToken as TokenInfo}
            kind={order.kind}
            outputToken={order.outputToken as TokenInfo}
            sellAmount={order.inputAmount.toString()}
            srcChainData={srcChainData}
          />
        ) : null)}
      {!hideReceiver && <ReceiverInfo receiver={receiver ?? order.receiver} owner={order.owner} />}
      {props.bottomContent}
    </div>
  )

  if (skipExplorerLink) {
    return content
  }

  return (
    <TransactionContentWithLink isEthFlow={isEthFlow} transactionHash={transactionHash} orderUid={orderUid}>
      {content}
    </TransactionContentWithLink>
  )
}
