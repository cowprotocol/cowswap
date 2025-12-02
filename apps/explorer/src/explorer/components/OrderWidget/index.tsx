import React from 'react'

import { OrderDetails } from '../../../components/orders/OrderDetails'
import { useOrderAndErc20s } from '../../../hooks/useOperatorOrder'
import { useOrderTrades } from '../../../hooks/useOperatorTrades'
import { useSanitizeOrderIdAndUpdateUrl } from '../../../hooks/useSanitizeOrderIdAndUpdateUrl'
import { RedirectToNetwork, useNetworkId } from '../../../state/network'
import { ORDER_QUERY_INTERVAL } from '../../const'
import { useTable } from '../TokensTableWidget/useTable'

const RESULTS_PER_PAGE = 10

export const OrderWidget: React.FC = () => {
  const networkId = useNetworkId()
  const orderId = useSanitizeOrderIdAndUpdateUrl()

  const {
    state: tableState,
    setPageSize,
    setPageOffset,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: RESULTS_PER_PAGE } })

  const {
    order,
    isLoading: isOrderLoading,
    errors,
    errorOrderPresentInNetworkId,
  } = useOrderAndErc20s(orderId, ORDER_QUERY_INTERVAL)
  const {
    trades,
    error,
    isLoading: areTradesLoading,
    hasNextPage,
  } = useOrderTrades(order, tableState.pageOffset, tableState.pageSize)

  // eslint-disable-next-line react-hooks/immutability
  tableState['hasNextPage'] = hasNextPage

  if (error) {
    // eslint-disable-next-line react-hooks/immutability
    errors['trades'] = error
  }

  if (errorOrderPresentInNetworkId && networkId !== errorOrderPresentInNetworkId) {
    return <RedirectToNetwork networkId={errorOrderPresentInNetworkId} />
  }

  return (
    <OrderDetails
      order={order}
      trades={trades}
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
