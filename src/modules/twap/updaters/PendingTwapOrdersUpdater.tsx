import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { OrderParameters } from '@cowprotocol/cow-sdk'

import { ComposableCoW } from 'abis/types'

import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { TradeableOrderWithSignature, useTwapOrdersTradeableMulticall } from '../hooks/useTwapOrdersTradeableMulticall'
import { TwapOrdersSafeData } from '../services/fetchTwapOrdersFromSafe'
import {
  TwapDiscreteOrderItem,
  TwapDiscreteOrdersList,
  updateTwapDiscreteOrdersListAtom,
} from '../state/twapDiscreteOrdersListAtom'
import { twapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TWAPOrderItem } from '../types'
import { encodeConditionalOrderParams } from '../utils/encodeConditionalOrderParams'
import { getTwapOrderStatus } from '../utils/getTwapOrderStatus'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

export function PendingTwapOrdersUpdater(props: { account: string; composableCowContract: ComposableCoW }) {
  const { account, composableCowContract } = props

  const setTwapOrders = useUpdateAtom(twapOrdersListAtom)
  const updateTwapDiscreteOrders = useUpdateAtom(updateTwapDiscreteOrdersListAtom)

  const ordersSafeData = useFetchTwapOrdersFromSafe(props)

  const ordersConditionalParams = useMemo(() => {
    return ordersSafeData.map(({ params }) => params)
  }, [ordersSafeData])

  const ordersHashes = useMemo(() => {
    return ordersConditionalParams.map(encodeConditionalOrderParams)
  }, [ordersConditionalParams])

  const ordersAuth = useTwapOrdersAuthMulticall(account, composableCowContract, ordersHashes)
  const ordersTradeableData = useTwapOrdersTradeableMulticall(account, composableCowContract, ordersConditionalParams)

  const twapOrders = useMemo(() => {
    const targetDataLength = ordersSafeData.length
    const isDataConsistent = [ordersHashes, ordersAuth].every((data) => data.length === targetDataLength)

    if (!isDataConsistent) return null

    return ordersSafeData.map((safeData, index) => {
      return getTWAPOrderItem(account, safeData, ordersHashes[index], !!ordersAuth[index])
    })
  }, [account, ordersSafeData, ordersHashes, ordersAuth])

  const discreteOrders = useMemo(() => {
    if (ordersHashes.length !== ordersTradeableData.length) return null

    return ordersHashes.reduce((acc, hash, index) => {
      const data = ordersTradeableData[index]
      if (!data) return acc

      const item = getTwapDiscreteOrderItem(hash, data)
      if (!item) return acc

      acc[hash] = item
      return acc
    }, {} as TwapDiscreteOrdersList)
  }, [ordersHashes, ordersTradeableData])

  useEffect(() => {
    if (!twapOrders) return

    setTwapOrders(twapOrders)
  }, [twapOrders, setTwapOrders])

  useEffect(() => {
    if (!discreteOrders) return

    updateTwapDiscreteOrders(discreteOrders)
  }, [discreteOrders, updateTwapDiscreteOrders])

  return null
}

function getTWAPOrderItem(
  safeAddress: string,
  safeData: TwapOrdersSafeData,
  hash: string,
  auth: boolean
): TWAPOrderItem {
  const { params, submissionDate, isExecuted } = safeData

  const order = parseTwapOrderStruct(params.staticInput)
  const status = getTwapOrderStatus(order, isExecuted, auth)

  return {
    order,
    status,
    safeAddress,
    hash,
    submissionDate,
  }
}

function getTwapDiscreteOrderItem(hash: string, data: TradeableOrderWithSignature): TwapDiscreteOrderItem | null {
  if (!data) return null

  const { order: discreteOrder, signature } = data
  const order = {
    ...discreteOrder,
    sellAmount: discreteOrder.sellAmount.toString(),
    buyAmount: discreteOrder.buyAmount.toString(),
    feeAmount: discreteOrder.feeAmount.toString(),
  } as OrderParameters

  return { order, signature }
}
