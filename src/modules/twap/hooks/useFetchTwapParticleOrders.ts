import { useMemo } from 'react'

import type { Order } from '@cowprotocol/contracts'
import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAsyncMemo } from 'use-async-memo'

import { ComposableCoW } from 'abis/types'
import { computeDiscreteOrderUid } from 'utils/orderUtils/computeDiscreteOrderUid'

import { TradeableOrderWithSignature, useTwapOrdersTradeableMulticall } from './useTwapOrdersTradeableMulticall'

import { TwapParticleOrderItem, TwapParticleOrders } from '../state/twapParticleOrdersAtom'
import { TwapOrderInfo } from '../types'

export function useFetchTwapParticleOrders(
  safeAddress: string,
  chainId: SupportedChainId,
  composableCowContract: ComposableCoW,
  ordersInfo: TwapOrderInfo[]
): TwapParticleOrders | null {
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
          return data ? getTwapParticleOrderItem(chainId, safeAddressLowerCase, data, id) : Promise.resolve(null)
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
    }, {} as TwapParticleOrders)
  }, [ordersInfo, items])
}

async function getTwapParticleOrderItem(
  chainId: SupportedChainId,
  safeAddress: string,
  data: TradeableOrderWithSignature,
  twapOrderId: string
): Promise<TwapParticleOrderItem | null> {
  if (!data) return null

  const { order: particleOrder, signature } = data
  const { sellToken, buyToken, receiver, validTo, appData } = particleOrder
  const fixedOrder = {
    sellToken,
    buyToken,
    receiver,
    validTo,
    appData,
    sellAmount: particleOrder.sellAmount.toString(),
    buyAmount: particleOrder.buyAmount.toString(),
    feeAmount: particleOrder.feeAmount.toString(),
    kind: 'sell', // TODO: discuss it, smart-contract returns bytes here
    partiallyFillable: particleOrder.partiallyFillable,
  } as Order

  const uid = await computeDiscreteOrderUid(chainId, safeAddress, fixedOrder)

  return { uid, chainId, safeAddress, twapOrderId, order: fixedOrder as OrderParameters, signature }
}
