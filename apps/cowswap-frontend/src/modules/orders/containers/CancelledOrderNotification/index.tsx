import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isAddress, isSellOrder, shortenAddress, shortenOrderId } from '@cowprotocol/common-utils'
import { OnCancelledOrderPayload } from '@cowprotocol/events'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { ExplorerLink } from 'legacy/components/ExplorerLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { useOrder } from 'legacy/state/orders/hooks'

import { OrderLinkWrapper } from '../../pure/commonStyled'

export interface PendingOrderNotificationProps {
  payload: OnCancelledOrderPayload
  onToastMessage(message: string): void
}

export function CancelledOrderNotification(props: PendingOrderNotificationProps) {
  const {
    payload: { chainId, orderUid, transactionHash },
    onToastMessage,
  } = props

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (node) onToastMessage(node.innerText)
    },
    [onToastMessage]
  )

  const order = useOrder({ chainId, id: orderUid })

  const inputAmount = useMemo(() => {
    if (!order) return null
    return CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(order.inputToken), order.sellAmount)
  }, [order])

  const outputAmount = useMemo(() => {
    if (!order) return null
    return CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(order.outputToken), order.buyAmount)
  }, [order])

  if (!order) return

  const { receiver, kind, owner } = order
  const isSell = isSellOrder(kind)
  const toAddress = receiver && isAddress(receiver) ? shortenAddress(receiver) : receiver

  const inputAmountElement = <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} />
  const outputAmountElement = <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />

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
        <div>
          {isSell ? (
            <>
              Sell {inputAmountElement} for at least {outputAmountElement}
            </>
          ) : (
            <>
              Buy {outputAmountElement} for at most {inputAmountElement}
            </>
          )}
        </div>
        {toAddress && receiver && receiver !== owner && (
          <div>
            Receiver: <ExplorerLink id={receiver} label={toAddress} type="address" />
          </div>
        )}
      </div>
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
