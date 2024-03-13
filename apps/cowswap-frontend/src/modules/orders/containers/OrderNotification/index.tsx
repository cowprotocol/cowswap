import { useCallback, useMemo } from 'react'

import { isCowOrder, shortenOrderId } from '@cowprotocol/common-utils'
import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ToastMessageType } from '@cowprotocol/events'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'
import { useIsSafeWallet } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useOrder } from 'legacy/state/orders/hooks'

import {
  OrderInfo,
  getToastMessageCallback,
  mapEnrichedOrderToInfo,
  mapStoreOrderToInfo,
  isEnrichedOrder,
} from './utils'

import { OrderSummary } from '../../pure/OrderSummary'
import { ReceiverInfo } from '../../pure/ReceiverInfo'
import { TransactionContentWithLink } from '../TransactionContentWithLink'

const OrderLinkWrapper = styled.div`
  margin-top: 15px;
  text-decoration: underline;

  &:hover,
  &:hover a {
    text-decoration: none !important;
  }
`

export interface BaseOrderNotificationProps {
  title: JSX.Element | string
  messageType: ToastMessageType
  chainId: SupportedChainId
  orderUid: string
  orderType: UiOrderType
  orderInfo?: OrderInfo | EnrichedOrder
  transactionHash?: string
  children?: JSX.Element
}

export function OrderNotification(props: BaseOrderNotificationProps) {
  const { title, orderUid, orderType, transactionHash, chainId, messageType, children, orderInfo } = props

  const isSafeWallet = useIsSafeWallet()
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
    <TransactionContentWithLink transactionHash={transactionHash} orderUid={orderUid}>
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
            sellAmount={order.inputAmount.toString()}
            buyAmount={order.outputAmount.toString()}
          />
        )}
        <ReceiverInfo receiver={order.receiver} owner={order.owner} />
      </div>
    </TransactionContentWithLink>
  )
}
