import { useMemo } from 'react'

import { OrderParameters } from '@cowprotocol/cow-sdk'

import { ComposableCoW } from 'abis/types'

import { TradeableOrderWithSignature, useTwapOrdersTradeableMulticall } from './useTwapOrdersTradeableMulticall'

import { TwapDiscreteOrderItem, TwapDiscreteOrdersList } from '../state/twapDiscreteOrdersListAtom'
import { TwapOrderInfo } from '../types'

export function useFetchDiscreteOrders(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  ordersInfo: TwapOrderInfo[]
): TwapDiscreteOrdersList | null {
  const ordersToVerifyParams = useMemo(() => {
    return ordersInfo.map((info) => info.safeData.params)
  }, [ordersInfo])

  const ordersTradeableData = useTwapOrdersTradeableMulticall(safeAddress, composableCowContract, ordersToVerifyParams)

  return useMemo(() => {
    if (ordersInfo.length !== ordersTradeableData.length) return null

    return ordersInfo.reduce((acc, { id }, index) => {
      const data = ordersTradeableData[index]
      if (!data) return acc

      const item = getTwapDiscreteOrderItem(id, data)
      if (!item) return acc

      acc[id] = item
      return acc
    }, {} as TwapDiscreteOrdersList)
  }, [ordersInfo, ordersTradeableData])
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
