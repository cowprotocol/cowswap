import { useEffect, useMemo, useRef, useState } from 'react'

import { TwapOrderInfo, TwapOrdersSafeData } from '../types'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

export function useAllTwapOrdersInfo(ordersSafeData: TwapOrdersSafeData[]): TwapOrderInfo[] {
  const [allOrdersInfo, setAllOrdersInfo] = useState<Record<string, TwapOrderInfo>>({})
  const allOrdersInfoRef = useRef(allOrdersInfo)

  // eslint-disable-next-line react-hooks/refs
  allOrdersInfoRef.current = allOrdersInfo

  useEffect(() => {
    const parsed = parseOrdersSafeData(ordersSafeData)
    const ordersToAdd = parsed.filter((item) => !allOrdersInfoRef.current[item.id])

    if (!ordersToAdd.length) return

    const update = ordersToAdd.reduce<Record<string, TwapOrderInfo>>((acc, item) => {
      acc[item.id] = item

      return acc
    }, {})

    setAllOrdersInfo((state) => {
      return { ...state, ...update }
    })
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
        orderStruct: parseTwapOrderStruct(data.conditionalOrderParams.staticInput),
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
