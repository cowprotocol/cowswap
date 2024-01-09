import React, { useContext, useState, useEffect } from 'react'

import OrdersTable from 'components/orders/OrdersUserDetailsTable'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { OrdersTableContext } from './context/OrdersTableContext'
import useFirstRender from 'hooks/useFirstRender'
import { DEFAULT_TIMEOUT } from 'const'
import { useSearchInAnotherNetwork, EmptyOrdersMessage } from './useSearchInAnotherNetwork'
import CowLoading from 'components/common/CowLoading'

export const OrdersTableWithData: React.FC = () => {
  const {
    data: orders,
    addressAccountParams: { ownerAddress, networkId },
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
    <EmptyItemWrapper>
      <CowLoading />
    </EmptyItemWrapper>
  ) : (
    <OrdersTable
      orders={orders}
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
