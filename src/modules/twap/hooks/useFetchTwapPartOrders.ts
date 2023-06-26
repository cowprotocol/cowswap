import { useMemo } from 'react'

import type { Order } from '@cowprotocol/contracts'
import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAsyncMemo } from 'use-async-memo'

import { ComposableCoW } from 'abis/types'
import { computeOrderUid } from 'utils/orderUtils/computeOrderUid'

import { TradeableOrderWithSignature, useTwapOrdersTradeableMulticall } from './useTwapOrdersTradeableMulticall'

import { TwapPartOrderItem, TwapPartOrders } from '../state/twapPartOrdersAtom'
import { TwapOrderInfo } from '../types'

export function useFetchTwapPartOrders(
  safeAddress: string,
  chainId: SupportedChainId,
  composableCowContract: ComposableCoW,
  ordersInfo: TwapOrderInfo[]
): TwapPartOrders | null {
  const ordersToVerifyParams = useMemo(() => {
    return ordersInfo.map((info) => info.safeData.conditionalOrderParams)
  }, [ordersInfo])

  const ordersTradeableData = useTwapOrdersTradeableMulticall(safeAddress, composableCowContract, ordersToVerifyParams)

  const items = useAsyncMemo(
    () => {
      if (ordersInfo.length !== ordersTradeableData.length) return null

      const safeAddressLowerCase = safeAddress.toLowerCase()

      return Promise.all(
        ordersInfo.map(({ id }, index) => {
          const data = ordersTradeableData[index]
          return data ? getTwapPartOrderItem(chainId, safeAddressLowerCase, data, id) : Promise.resolve(null)
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
    }, {} as TwapPartOrders)
  }, [ordersInfo, items])
}

async function getTwapPartOrderItem(
  chainId: SupportedChainId,
  safeAddress: string,
  data: TradeableOrderWithSignature,
  twapOrderId: string
): Promise<TwapPartOrderItem | null> {
  if (!data) return null

  const { order: partOrder, signature } = data
  const { sellToken, buyToken, receiver, validTo, appData } = partOrder
  const fixedOrder = {
    sellToken,
    buyToken,
    receiver,
    validTo,
    appData,
    sellAmount: partOrder.sellAmount.toString(),
    buyAmount: partOrder.buyAmount.toString(),
    feeAmount: partOrder.feeAmount.toString(),
    kind: 'sell', // Twap order is always sell
    partiallyFillable: partOrder.partiallyFillable,
  } as Order

  const uid = await computeOrderUid(chainId, safeAddress, fixedOrder)

  return { uid, chainId, safeAddress, twapOrderId, order: fixedOrder as OrderParameters, signature }
}
