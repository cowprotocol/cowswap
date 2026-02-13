import React, { ReactNode } from 'react'

import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useGetSpotPrice, usePendingOrdersPrices } from 'modules/orders'
import { useOrderActions } from 'modules/ordersTable/hooks/useOrderActions'

import { OrdersTableRowGroup } from './Group/OrdersTableRowGroup.pure'

import { OrderRow } from '../../../containers/OrderRow/OrderRow.container'
import { useOrdersTableState } from '../../../hooks/useOrdersTableState'
import { OrderTableItem } from '../../../state/ordersTable.types'
import { useGetPendingOrdersPermitValidityState } from '../../../state/permit/usePendingOrderPermitValidity'
import { OrderTabId } from '../../../state/tabs/ordersTableTabs.constants'
import { getOrderParams } from '../../../utils/getOrderParams'
import { getParsedOrderFromTableItem, isParsedOrder } from '../../../utils/orderTableGroupUtils'
import { useAtomValue } from 'jotai'
import { ordersToCancelMapAtom } from 'common/hooks/useMultipleOrdersCancellation/ordersToCancel.atom'

interface OrderTableRowProps {
  currentTab: OrderTabId
  isTwapTable: boolean
  item: OrderTableItem
}

export function OrdersTableRow({ currentTab, isTwapTable, item }: OrderTableRowProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const tableState = useOrdersTableState()
  const pendingOrdersPermitValidityState = useGetPendingOrdersPermitValidityState()
  const getSpotPrice = useGetSpotPrice()
  const pendingOrdersPrices = usePendingOrdersPrices()
  const ordersToCancelMap = useAtomValue(ordersToCancelMapAtom)
  const orderActions = useOrderActions()

  if (!tableState) return null

  const { balancesAndAllowances } = tableState

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
