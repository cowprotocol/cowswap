import { ReactNode, useCallback, useMemo } from 'react'

import { shortenOrderId } from '@cowprotocol/common-utils'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { ToastMessageType } from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'

import { Trans } from '@lingui/react/macro'

import { OrderSummary } from 'common/pure/OrderSummary'
import type { SellForAtLeastTemplate } from 'common/pure/OrderSummary/summaryTemplates'

import { getToastMessageCallback } from './utils'

import { TransactionContentWithLink } from '../../containers/TransactionContentWithLink'
import { OrderNotificationInfo } from '../../types'
import { ReceiverInfo } from '../ReceiverInfo'

export interface OrderNotificationContentProps {
  title: ReactNode
  messageType: ToastMessageType
  orderInfo: OrderNotificationInfo
  srcChainData?: ChainInfo
  dstChainData?: ChainInfo
  actionTitle?: string
  customTemplate?: typeof SellForAtLeastTemplate
  skipExplorerLink?: boolean
  hideReceiver?: boolean
  transactionHash?: string
  bottomContent?: ReactNode
  children?: ReactNode
}

export function OrderNotificationContent({
  title,
  orderInfo,
  srcChainData,
  dstChainData,
  messageType,
  actionTitle,
  customTemplate,
  transactionHash,
  skipExplorerLink,
  hideReceiver,
  bottomContent,
  children,
}: OrderNotificationContentProps): ReactNode {
  const ref = useToastRenderRef(orderInfo.orderUid, messageType, orderInfo.orderType)

  const content = (
    <div ref={ref}>
      <strong>{title}</strong>
      <br />
      <p>
        <Trans>Order</Trans> <strong>{shortenOrderId(orderInfo.orderUid)}</strong>:
      </p>
      {children || (
        <OrderSummary
          actionTitle={actionTitle}
          customTemplate={customTemplate}
          kind={orderInfo.kind}
          inputAmount={orderInfo.inputAmount}
          outputAmount={orderInfo.outputAmount}
          srcChainData={srcChainData}
          dstChainData={dstChainData}
        />
      )}
      {!hideReceiver && <ReceiverInfo receiver={orderInfo.receiver} owner={orderInfo.owner} />}
      {bottomContent}
    </div>
  )

  if (skipExplorerLink) {
    return content
  }

  return (
    <TransactionContentWithLink
      isEthFlow={orderInfo.isEthFlowOrder}
      transactionHash={transactionHash}
      orderUid={orderInfo.orderUid}
    >
      {content}
    </TransactionContentWithLink>
  )
}

function useToastRenderRef(
  orderUid: string,
  messageType: ToastMessageType,
  orderType: UiOrderType | undefined,
): (node: HTMLDivElement) => void {
  const onToastMessage = useMemo(() => {
    if (!orderType) return null

    return getToastMessageCallback(messageType, {
      orderUid,
      orderType,
    })
  }, [messageType, orderType, orderUid])

  return useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        onToastMessage?.(node.innerText)
      }
    },
    [onToastMessage],
  )
}
