import { useCallback, useMemo } from 'react'

import { isCowOrder, shortenOrderId } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowEvents, OnToastMessagePayload, ToastMessagePayloads, ToastMessageType } from '@cowprotocol/events'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import { EVENT_EMITTER } from 'eventEmitter'
import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useOrder } from 'legacy/state/orders/hooks'

import { OrderSummary } from '../../pure/OrderSummary'
import { ReceiverInfo } from '../../pure/ReceiverInfo'

function getToastMessageCallback(
  messageType: ToastMessageType,
  data: ToastMessagePayloads[typeof messageType]
): (toastMessage: string) => void {
  return (toastMessage: string) => {
    const payload = {
      messageType,
      message: toastMessage,
      data,
    }

    EVENT_EMITTER.emit(CowEvents.ON_TOAST_MESSAGE, payload as OnToastMessagePayload)
  }
}

const OrderLinkWrapper = styled.div`
  margin-top: 15px;
  text-decoration: underline;

  &:hover,
  &:hover a {
    text-decoration: none !important;
  }
`

interface OrderInfo {
  owner: string
  kind: OrderKind
  receiver?: string
  inputAmount: bigint
  outputAmount: bigint
  inputToken: TokenInfo
  outputToken: TokenInfo
}

export interface BaseOrderNotificationProps {
  title: JSX.Element | string
  messageType: ToastMessageType
  chainId: SupportedChainId
  orderUid: string
  orderType: UiOrderType
  orderInfo?: OrderInfo
  transactionHash?: string
  children?: JSX.Element
}

export function OrderNotification(props: BaseOrderNotificationProps) {
  const { title, orderUid, orderType, transactionHash, chainId, messageType, children, orderInfo } = props

  const isSafeWallet = useIsSafeWallet()
  const orderFromStore = useOrder({ chainId, id: orderInfo ? undefined : orderUid })
  const order = useMemo(() => {
    if (orderInfo) return orderInfo

    if (!orderFromStore) return undefined

    return {
      ...orderFromStore,
      inputAmount: orderFromStore?.sellAmount,
      outputAmount: orderFromStore?.buyAmount,
    }
  }, [orderFromStore, orderInfo])

  const onToastMessage = useMemo(
    () =>
      getToastMessageCallback(messageType, {
        orderUid,
        orderType,
      }),
    [messageType, orderType, orderUid]
  )

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node) onToastMessage(node.innerText)
    },
    [onToastMessage]
  )

  if (!order) return

  const tx = {
    hash: transactionHash || orderUid,
    hashType:
      isSafeWallet && transactionHash && !isCowOrder('transaction', transactionHash)
        ? HashType.GNOSIS_SAFE_TX
        : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: transactionHash || '',
      safe: order.owner,
    },
  }

  return (
    <>
      <div ref={ref}>
        <strong>{title}</strong>
        <br />
        <p>
          Order <strong>{shortenOrderId(orderUid)}</strong>:
        </p>
        {children || (
          <OrderSummary
            kind={order.kind}
            inputToken={order.inputToken as TokenInfo}
            outputToken={order.outputToken as TokenInfo}
            sellAmount={order.inputAmount}
            buyAmount={order.outputAmount}
          />
        )}
        <ReceiverInfo receiver={order.receiver} owner={order.owner} />
      </div>
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
