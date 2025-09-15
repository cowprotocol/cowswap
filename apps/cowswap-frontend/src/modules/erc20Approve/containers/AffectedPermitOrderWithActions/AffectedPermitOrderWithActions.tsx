import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Order } from 'legacy/state/orders/actions'

import { OrderContextMenu } from 'modules/ordersTable/containers/OrderRow/OrderContextMenu'
import { getActivityUrl } from 'modules/ordersTable/containers/OrderRow/utils'
import { useOrdersTableState } from 'modules/ordersTable/hooks/useOrdersTableState'
import { OrderStatusBox } from 'modules/ordersTable/pure/OrderStatusBox'

import { parseOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export type AffectedPermitOrderProps = {
  order: Order
}

export function AffectedPermitOrderWithActions({ order }: AffectedPermitOrderProps): ReactNode {
  const { orderActions } = useOrdersTableState() ?? {}
  const parsedOrder = parseOrder(order)
  const cancelOrder = orderActions?.getShowCancellationModal(parsedOrder)
  const activityUrl = getActivityUrl(order.inputToken.chainId, parsedOrder)

  const inputAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const outputAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())

  return (
    <>
      <styledEl.SwapInfo>
        <styledEl.TokenLogos>
          <TokenLogo size={28} token={order.inputToken} hideNetworkBadge />
          <TokenLogo size={28} token={order.outputToken} hideNetworkBadge />
        </styledEl.TokenLogos>
        <styledEl.AmountInfo>
          <TokenAmount className={'token-amount'} amount={inputAmount} tokenSymbol={order.inputToken} />
          <TokenAmount className={'token-amount'} amount={outputAmount} tokenSymbol={order.outputToken} />
        </styledEl.AmountInfo>
      </styledEl.SwapInfo>
      <styledEl.OrderActionsWrapper>
        <OrderStatusBox
          order={parsedOrder}
          onClick={() => {
            orderActions?.selectReceiptOrder(parsedOrder)
          }}
        />
        <OrderContextMenu
          openReceipt={() => orderActions?.selectReceiptOrder(parsedOrder)}
          activityUrl={activityUrl}
          showCancellationModal={() => cancelOrder?.()}
          alternativeOrderModalContext={null}
        ></OrderContextMenu>
      </styledEl.OrderActionsWrapper>
    </>
  )
}
