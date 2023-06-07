import { useMemo } from 'react'

import type { Order } from '@cowprotocol/contracts'
import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAsyncMemo } from 'use-async-memo'

import { ComposableCoW } from 'abis/types'
import { computeDiscreteOrderUid } from 'utils/orderUtils/computeDiscreteOrderUid'

import { TradeableOrderWithSignature, useTwapOrdersTradeableMulticall } from './useTwapOrdersTradeableMulticall'

import { TwapDiscreteOrderItem, TwapDiscreteOrders } from '../state/twapDiscreteOrdersAtom'
import { TwapOrderInfo } from '../types'

export function useFetchDiscreteOrders(
  safeAddress: string,
  chainId: SupportedChainId,
  composableCowContract: ComposableCoW,
  ordersInfo: TwapOrderInfo[]
): TwapDiscreteOrders | null {
  const ordersToVerifyParams = useMemo(() => {
    return ordersInfo.map((info) => info.safeData.params)
  }, [ordersInfo])

  const ordersTradeableData = useTwapOrdersTradeableMulticall(safeAddress, composableCowContract, ordersToVerifyParams)

  const items = useAsyncMemo(
    () => {
      if (ordersInfo.length !== ordersTradeableData.length) return null

      const safeAddressLowerCase = safeAddress.toLowerCase()

      return Promise.all(
        ordersInfo.map(({ id }, index) => {
          const data = ordersTradeableData[index]
          return data ? getTwapDiscreteOrderItem(chainId, safeAddressLowerCase, data, id) : Promise.resolve(null)
        })
      )
    },
    [chainId, safeAddress, ordersInfo, ordersTradeableData],
    null
  )

  return useMemo(() => {
    if (!items) return null

    return ordersInfo.reduce((acc, { id }, index) => {
      const item = items[index]

      if (item) acc[id] = item

      return acc
    }, {} as TwapDiscreteOrders)
  }, [ordersInfo, items])
}

async function getTwapDiscreteOrderItem(
  chainId: SupportedChainId,
  safeAddress: string,
  data: TradeableOrderWithSignature,
  twapOrderId: string
): Promise<TwapDiscreteOrderItem | null> {
  if (!data) return null

  const { order: discreteOrder, signature } = data
  const { sellToken, buyToken, receiver, validTo, appData } = discreteOrder
  const fixedOrder = {
    sellToken,
    buyToken,
    receiver,
    validTo,
    appData,
    sellAmount: discreteOrder.sellAmount.toString(),
    buyAmount: discreteOrder.buyAmount.toString(),
    feeAmount: discreteOrder.feeAmount.toString(),
    kind: 'sell', // TODO: discuss it, smart-contract returns bytes here
    partiallyFillable: discreteOrder.partiallyFillable,
  } as Order

  const uid = await computeDiscreteOrderUid(chainId, safeAddress, fixedOrder)

  return { uid, chainId, safeAddress, twapOrderId, order: fixedOrder as OrderParameters, signature }
}
