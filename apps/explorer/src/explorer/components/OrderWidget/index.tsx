import React from 'react'

import { OrderDetails } from '../../../components/orders/OrderDetails'
import { useOrderAndErc20s } from '../../../hooks/useOperatorOrder'
import { useOrderTrades } from '../../../hooks/useOperatorTrades'
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
    protocolFees,
    error,
    isLoading: areTradesLoading,
    hasNextPage,
  } = useOrderTrades(order, baseTableState.pageOffset, baseTableState.pageSize)

  const tableState: TableState = { ...baseTableState, hasNextPage }
  const errors: Errors = { ...orderErrors }
  if (error) {
    errors.trades = error
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
