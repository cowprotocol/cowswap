import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Order } from 'legacy/state/orders/actions'

import * as styledEl from './styled'

import { parseOrder } from '../../../../utils/orderUtils/parseOrder'
import { useOrdersTableState } from '../../../ordersTable/hooks/useOrdersTableState'
import { OrderStatusBox } from '../../../ordersTable/pure/OrderStatusBox'

export type AffectedOrdersWithPermitProps = {
  orders: Order[]
}

export function AffectedOrdersWithPermit({ orders }: AffectedOrdersWithPermitProps): ReactNode {
  const { orderActions } = useOrdersTableState() ?? {}

  console.log('orderActions', orderActions)

  return orders.map((order) => {
    const inputAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
    const outputAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
    const parsedOrder = parseOrder(order)

    return (
      <styledEl.OrderWrapper key={order.id}>
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
        </styledEl.OrderActionsWrapper>
      </styledEl.OrderWrapper>
    )
  })
}
