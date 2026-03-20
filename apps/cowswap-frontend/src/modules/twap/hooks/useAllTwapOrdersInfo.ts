import { useEffect, useMemo, useState } from 'react'

import { TwapOrderInfo, TwapOrdersSafeData } from '../types'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

/**
 * Builds the current TWAP order info map from Safe Transaction Service data.
 * Replaces state on each snapshot so proposals removed from the Safe queue disappear here too.
 */
export function useAllTwapOrdersInfo(ordersSafeData: TwapOrdersSafeData[]): TwapOrderInfo[] {
  const [allOrdersInfo, setAllOrdersInfo] = useState<Record<string, TwapOrderInfo>>({})

  useEffect(() => {
    const parsed = parseOrdersSafeData(ordersSafeData)
    const nextMap = parsed.reduce<Record<string, TwapOrderInfo>>((acc, item) => {
      acc[item.id] = item
      return acc
    }, {})

    setAllOrdersInfo(nextMap)
  }, [ordersSafeData])

  return useMemo(() => Object.values(allOrdersInfo), [allOrdersInfo])
}

function parseOrdersSafeData(ordersSafeData: TwapOrdersSafeData[]): TwapOrderInfo[] {
  const ordersInfoMap = ordersSafeData.reduce<{ [id: string]: TwapOrderInfo }>((acc, data) => {
    try {
      const id = getConditionalOrderId(data.conditionalOrderParams)
      const existingOrder = acc[id]

      /**
       * There might be two Safe transactions with the same order inside.
       * But only one of them will be executed.
       *
       * For example, you propose a transaction with TWAP order and execute it.
       * Then, you propose another transaction with the same TWAP order.
       * After you realize that the proposed transaction is a duplicate, and you replace it or cancel.
       * In this case we should skip the second transaction, because the first one is already executed.
       */
      if (existingOrder?.safeData.safeTxParams.isExecuted) {
        return acc
      }

      const info = {
        id,
        orderStruct: parseTwapOrderStruct(data.conditionalOrderParams.staticInput as `0x${string}`),
        safeData: data,
      }

      acc[id] = info
    } catch {
      // Do nothing
    }

    return acc
  }, {})

  return Object.values(ordersInfoMap)
}
