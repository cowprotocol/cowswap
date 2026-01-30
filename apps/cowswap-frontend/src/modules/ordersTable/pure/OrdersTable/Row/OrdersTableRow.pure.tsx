import React, { ReactNode, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { OrdersTableRowGroup } from './Group/OrdersTableRowGroup.pure'

import { OrderRow } from '../../../containers/OrderRow/OrderRow.container'
import { getOrderParams } from '../../../shared/utils/getOrderParams'
import { getParsedOrderFromTableItem, isParsedOrder } from '../../../shared/utils/orderTableGroupUtils'
import { OrderTableItem } from '../../../state/ordersTable.types'
import { useGetPendingOrdersPermitValidityState } from '../../../state/permit/usePendingOrderPermitValidity'
import { OrderTabId } from '../../../state/tabs/ordersTableTabs.constants'
import { useOrdersTableState } from '../../../state/useOrdersTableState'

interface OrderTableRowProps {
  currentTab: OrderTabId
  item: OrderTableItem
}

export function OrdersTableRow({ item, currentTab }: OrderTableRowProps): ReactNode {
  const { chainId } = useWalletInfo()
  const tableState = useOrdersTableState()
  const selectedOrders = tableState?.selectedOrders
  const pendingOrdersPermitValidityState = useGetPendingOrdersPermitValidityState()
  const selectedOrdersMap = useMemo(() => {
    if (!selectedOrders) return {}

    return selectedOrders.reduce(
      (acc, val) => {
        acc[val.id] = true
        return acc
      },
      {} as { [key: string]: true },
    )
  }, [selectedOrders])

  if (!tableState) return null

  const { pendingOrdersPrices, balancesAndAllowances, getSpotPrice, orderActions, isTwapTable, allowsOffchainSigning } =
    tableState

  const isRowSelectable = allowsOffchainSigning

  const { inputToken, outputToken } = getParsedOrderFromTableItem(item)

  const spotPrice = getSpotPrice({
    chainId,
    sellTokenAddress: inputToken.address,
    buyTokenAddress: outputToken.address,
  })

  if (isParsedOrder(item)) {
    const order = item

    return (
      <OrderRow
        isRowSelectable={isRowSelectable}
        isRowSelected={!!selectedOrdersMap[order.id]}
        isHistoryTab={currentTab === OrderTabId.history}
        order={order}
        spotPrice={spotPrice}
        prices={pendingOrdersPrices[order.id]}
        isRateInverted={false}
        orderParams={getOrderParams(chainId, balancesAndAllowances, order, pendingOrdersPermitValidityState)}
        onClick={() => orderActions.selectReceiptOrder(order)}
        orderActions={orderActions}
        isTwapTable={isTwapTable}
        chainId={chainId}
        balancesAndAllowances={balancesAndAllowances}
      />
    )
  } else {
    return (
      <OrdersTableRowGroup
        item={item}
        chainId={chainId}
        balancesAndAllowances={balancesAndAllowances}
        isRowSelectable={isRowSelectable}
        isRowSelected={!!selectedOrdersMap[item.parent.id]}
        isHistoryTab={currentTab === OrderTabId.history}
        spotPrice={spotPrice}
        prices={pendingOrdersPrices[item.parent.id]}
        isRateInverted={false}
        orderActions={orderActions}
        isTwapTable={isTwapTable}
      />
    )
  }
}
