import React from 'react'

import { OrderDetails } from '../../../components/orders/OrderDetails'
import { useOrderAndErc20s } from '../../../hooks/useOperatorOrder'
import { useOrderProtocolFees, useOrderTrades } from '../../../hooks/useOperatorTrades'
import { useSanitizeOrderIdAndUpdateUrl } from '../../../hooks/useSanitizeOrderIdAndUpdateUrl'
import { RedirectToNetwork, useNetworkId } from '../../../state/network'
import { Errors } from '../../../types'
import { ORDER_QUERY_INTERVAL } from '../../const'
import { TableState, useTable } from '../TokensTableWidget/useTable'

const RESULTS_PER_PAGE = 10

export const OrderWidget: React.FC = () => {
  const networkId = useNetworkId()
  const orderId = useSanitizeOrderIdAndUpdateUrl()

  const {
    state: baseTableState,
    setPageSize,
    setPageOffset,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: RESULTS_PER_PAGE } })

  const {
    order,
    isLoading: isOrderLoading,
    errors: orderErrors,
    errorOrderPresentInNetworkId,
  } = useOrderAndErc20s(orderId, ORDER_QUERY_INTERVAL)
  const {
    trades,
    error,
    isLoading: areTradesLoading,
    hasNextPage,
  } = useOrderTrades(order, baseTableState.pageOffset, baseTableState.pageSize)

  // Protocol fee breakdown is order-level, so it's derived from all trades rather than the
  // currently selected fills page (which `useOrderTrades` is scoped to).
  const { protocolFees, error: protocolFeesError } = useOrderProtocolFees(order)

  // Copy the hook's objects instead of mutating them (they may be reused across renders). Surface the
  // protocol-fee error only when the trades fetch didn't already fail (same root cause; avoids a
  // duplicate banner).
  const tableState: TableState = { ...baseTableState, hasNextPage }
  const errors: Errors = { ...orderErrors }
  if (error) {
    errors.trades = error
  } else if (protocolFeesError) {
    errors.protocolFees = protocolFeesError
  }

  if (errorOrderPresentInNetworkId && networkId !== errorOrderPresentInNetworkId) {
    return <RedirectToNetwork networkId={errorOrderPresentInNetworkId} />
  }

  return (
    <OrderDetails
      order={order}
      trades={trades}
      protocolFees={protocolFees}
      isOrderLoading={isOrderLoading}
      areTradesLoading={areTradesLoading}
      errors={errors}
      tableState={tableState}
      setPageSize={setPageSize}
      setPageOffset={setPageOffset}
      handleNextPage={handleNextPage}
      handlePreviousPage={handlePreviousPage}
    />
  )
}
