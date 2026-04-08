import { useMemo } from 'react'

import { TwapOrderInfo, TwapOrdersSafeData } from '../types'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

/**
 * Maps Safe Transaction Service rows (see `fetchTwapOrdersFromSafe`) to TWAP order info.
 *
 * **Semantics:** This is a **snapshot** of what the API currently returns for the query we use
 * (`executed=false`, `queued=true`, etc.). We do **not** learn whether a missing proposal was
 * rejected, replaced, executed, or removed — only that it is **no longer in this listing**, so the
 * UI should stop treating it as “pending in queue” unless other logic (e.g. on-chain auth,
 * order-book parts) says otherwise.
 */
export function buildTwapOrderInfoListFromSafeData(ordersSafeData: TwapOrdersSafeData[]): TwapOrderInfo[] {
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

      const info: TwapOrderInfo = {
        id,
        orderStruct: parseTwapOrderStruct(data.conditionalOrderParams.staticInput as `0x${string}`),
        safeData: data,
      }

      acc[id] = info
    } catch {
      // Malformed conditional order payload; skip
    }

    return acc
  }, {})

  return Object.values(ordersInfoMap)
}

/**
 * Derives the list of TWAP orders that appear in the **current** Safe Transaction Service snapshot.
 * Purely derived from `ordersSafeData` (no sync effect), so it always matches the latest fetch.
 */
export function useAllTwapOrdersInfo(ordersSafeData: TwapOrdersSafeData[]): TwapOrderInfo[] {
  return useMemo(() => buildTwapOrderInfoListFromSafeData(ordersSafeData), [ordersSafeData])
}
