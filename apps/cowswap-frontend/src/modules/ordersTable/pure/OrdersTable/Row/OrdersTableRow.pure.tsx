import React, { ReactNode } from 'react'

import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { usePendingOrdersPrices } from 'modules/orders/hooks/usePendingOrdersPrices'
import { useGetSpotPrice } from 'modules/orders'

import { useOrdersToCancelMap } from 'common/hooks/useMultipleOrdersCancellation/useOrdersToCancelMap'

import { OrdersTableRowGroup } from './Group/OrdersTableRowGroup.pure'

import { OrderRow } from '../../../containers/OrderRow/OrderRow.container'
import { useOrdersTableState } from '../../../hooks/useOrdersTableState'
import { OrderTableItem } from '../../../state/ordersTable.types'
import { TabOrderTypes } from '../../../state/ordersTable.types'
import { useGetPendingOrdersPermitValidityState } from '../../../state/permit/usePendingOrderPermitValidity'
import { OrderTabId } from '../../../state/tabs/ordersTableTabs.constants'
import { getOrderParams } from '../../../utils/getOrderParams'
import { getParsedOrderFromTableItem, isParsedOrder } from '../../../utils/orderTableGroupUtils'

interface OrderTableRowProps {
  currentTab: OrderTabId
  item: OrderTableItem
}

export function OrdersTableRow({ item, currentTab }: OrderTableRowProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const tableState = useOrdersTableState()
  const pendingOrdersPermitValidityState = useGetPendingOrdersPermitValidityState()
  const getSpotPrice = useGetSpotPrice()
  const pendingOrdersPrices = usePendingOrdersPrices()
  const ordersToCancelMap = useOrdersToCancelMap()

  if (!tableState) return null

  const { balancesAndAllowances, orderActions, orderType } = tableState

  const isRowSelectable = allowsOffchainSigning
  const isTwapTable = orderType === TabOrderTypes.ADVANCED

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
        isRowSelected={!!ordersToCancelMap[order.id]}
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
        isRowSelected={!!ordersToCancelMap[item.parent.id]}
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
