import React, { useContext, useState, useEffect } from 'react'

import { OrdersTableContext } from './context/OrdersTableContext'
import { useSearchInAnotherNetwork, EmptyOrdersMessage } from './useSearchInAnotherNetwork'

import { LoadingWrapper } from '../../../components/common/LoadingWrapper'
import OrdersTable from '../../../components/orders/OrdersUserDetailsTable'
import { DEFAULT_TIMEOUT } from '../../../const'
import useFirstRender from '../../../hooks/useFirstRender'

export const OrdersTableWithData: React.FC = () => {
  const {
    data: orders,
    addressAccountParams: { ownerAddress, networkId },
    tableState,
    handleNextPage,
  } = useContext(OrdersTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)
  const {
    isLoading: searchInAnotherNetworkState,
    ordersInNetworks,
    setLoadingState,
    errorMsg: error,
  } = useSearchInAnotherNetwork(networkId, ownerAddress, orders)

  useEffect(() => {
    setIsFirstLoading(true)
  }, [networkId])

  useEffect(() => {
    let timeOutMs = 0
    if (!orders) {
      timeOutMs = DEFAULT_TIMEOUT
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutMs)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [orders, orders?.length])

  return isFirstRender || isFirstLoading ? (
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
