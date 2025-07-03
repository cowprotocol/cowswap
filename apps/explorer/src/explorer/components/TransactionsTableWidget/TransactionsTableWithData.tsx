import React, { useContext, useState, useEffect } from 'react'

import { TransactionsTableContext } from './context/TransactionsTableContext'

import { LoadingWrapper } from '../../../components/common/LoadingWrapper'
import TransactionTable from '../../../components/transaction/TransactionTable'
import { DEFAULT_TIMEOUT } from '../../../const'
import useFirstRender from '../../../hooks/useFirstRender'

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

  return isFirstRender || isFirstLoading ? <LoadingWrapper message="Loading transactions" /> : <TransactionTable orders={orders} />
}
