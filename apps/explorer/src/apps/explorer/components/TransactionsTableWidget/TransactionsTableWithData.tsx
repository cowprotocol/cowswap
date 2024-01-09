import React, { useContext, useState, useEffect } from 'react'

import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import useFirstRender from 'hooks/useFirstRender'
import { TransactionsTableContext } from 'apps/explorer/components/TransactionsTableWidget/context/TransactionsTableContext'
import TransactionTable from 'components/transaction/TransactionTable'
import { DEFAULT_TIMEOUT } from 'const'
import CowLoading from 'components/common/CowLoading'

export const TransactionsTableWithData: React.FC = () => {
  const {
    orders,
    txHashParams: { networkId },
  } = useContext(TransactionsTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)

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
    <TransactionTable orders={orders} />
  )
}
