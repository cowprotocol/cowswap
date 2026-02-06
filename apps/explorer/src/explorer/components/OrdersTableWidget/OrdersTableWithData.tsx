import React, { useContext } from 'react'

import { OrdersTableContext } from './context/OrdersTableContext'
import { useSearchInAnotherNetwork, EmptyOrdersMessage } from './useSearchInAnotherNetwork'

import { LoadingWrapper } from '../../../components/common/LoadingWrapper'
import OrdersTable from '../../../components/orders/OrdersUserDetailsTable'

export const OrdersTableWithData: React.FC = () => {
  const {
    data: orders,
    addressAccountParams: { ownerAddress, networkId },
    tableState,
    handleNextPage,
    isLoading: isOrdersLoading,
  } = useContext(OrdersTableContext)

  const {
    isLoading: searchInAnotherNetworkState,
    ordersInNetworks,
    setLoadingState,
    errorMsg: error,
  } = useSearchInAnotherNetwork(networkId, ownerAddress, orders)

  return isOrdersLoading ? (
    <LoadingWrapper message="Loading orders" />
  ) : (
    <OrdersTable
      orders={orders}
      tableState={tableState}
      handleNextPage={handleNextPage}
      messageWhenEmpty={
        <EmptyOrdersMessage
          isLoading={searchInAnotherNetworkState}
          networkId={networkId}
          ordersInNetworks={ordersInNetworks}
          ownerAddress={ownerAddress}
          setLoadingState={setLoadingState}
          errorMsg={error}
        />
      }
    />
  )
}
