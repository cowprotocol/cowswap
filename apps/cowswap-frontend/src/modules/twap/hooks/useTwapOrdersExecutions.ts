import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Order, OrderInfoApi } from 'legacy/state/orders/actions'
import { useOrdersById } from 'legacy/state/orders/hooks'

import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderExecutionInfo, TwapOrderInfo } from '../types'

export type TwapOrdersExecution = { info: TwapOrderExecutionInfo; confirmedPartsCount: number }
export type TwapOrdersExecutionMap = { [id: string]: TwapOrdersExecution }

type PartsIdsInfo = {
  sets: { [id: string]: Set<string> }
  ids: string[]
}

export function useTwapOrdersExecutions(allOrdersInfo: TwapOrderInfo[]): TwapOrdersExecutionMap {
  const { chainId } = useWalletInfo()
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)

  const { sets: partSets, ids: allPartIds } = useMemo(() => {
    return Object.keys(twapPartOrders).reduce<PartsIdsInfo>(
      (acc, val) => {
        const { sets, ids } = acc

        const partsIds = (twapPartOrders[val] || []).map((item) => item.uid)

        sets[val] = new Set<string>(partsIds)
        ids.push(...partsIds)

        return acc
      },
      { sets: {}, ids: [] }
    )
  }, [twapPartOrders])

  const allDiscreteOrdersMap = useOrdersById({ chainId, ids: allPartIds })

  const allDiscreteOrders = useMemo(() => {
    if (!allDiscreteOrdersMap) return []

    return Object.values(allDiscreteOrdersMap)
  }, [allDiscreteOrdersMap])

  return useMemo(() => {
    return allOrdersInfo.reduce<TwapOrdersExecutionMap>((acc, info) => {
      const id = info.id
      const childrenIds = partSets[id]

      if (childrenIds?.size > 0) {
        const discreteOrders = allDiscreteOrders.filter((order) => childrenIds.has(order.id))

        const executedBuyAmount = sumChildrenAmount(discreteOrders, 'executedBuyAmount').toString()
        const executedSellAmount = sumChildrenAmount(discreteOrders, 'executedSellAmount').toString()
        const executedFeeAmount = sumChildrenAmount(discreteOrders, 'executedFeeAmount').toString()
        const confirmedPartsCount = getConfirmedPartsCount(info, discreteOrders)

        acc[id] = {
          info: { executedSellAmount, executedFeeAmount, executedBuyAmount },
          confirmedPartsCount,
        }
      } else {
        acc[id] = { info: DEFAULT_TWAP_EXECUTION_INFO, confirmedPartsCount: 0 }
      }

      return acc
    }, {})
  }, [allOrdersInfo, partSets, allDiscreteOrders])
}

function sumChildrenAmount(children: Order[], key: keyof OrderInfoApi): bigint {
  return children.reduce((acc, order) => {
    return acc + BigInt((order.apiAdditionalInfo?.[key] || '0') as string)
  }, BigInt(0))
}

/**
 * There might be a case when a TWAP order consists of 3 orders (for example)
 * First two parts are expired (never been executed or event created in order-book)
 * And the last part is filled
 * The example on the picture: https://user-images.githubusercontent.com/7122625/258057476-19022558-5eb8-4e93-8afc-afd186bfbc30.png
 *
 * In this case the discreteOrders array will contain only one order (the last one)
 * So, we need to calculate the number of confirmed parts based on the time passed
 */
function getConfirmedPartsCount(twapOrderInfo: TwapOrderInfo, discreteOrders: Order[]): number {
  const { executionDate } = twapOrderInfo.safeData.safeTxParams
  const { t: timeInterval, n: numOfParts } = twapOrderInfo.orderStruct

  if (!executionDate) return 0

  /**
   * Calculate how many parts have been passed based on the time passed
   * For example:
   * 1. Order was created at 10:00
   * 2. Time interval is 20 mins
   * 3. Now is 11:00
   * 4. So, 11-10 = 1 hour passed (60 mins)
   * 5. 60 mins / 20 mins = 3 parts passed
   */
  const now = Math.ceil(Date.now() / 1000)
  const startTime = Math.ceil(new Date(executionDate).getTime() / 1000)
  const timePassed = now - startTime
  const partsPassed = Math.floor(timePassed / timeInterval)

  /**
   * But...there might be a case when only the last part is filled
   * Example:
   * 1. Order was created at 10:00
   * 2. Time interval is 20 mins
   * 3. Now is 10:45
   * 4. Following the formula above we will get 2 parts passed
   * 5. But the last part is filled at 10:42 and it will only expire at 11:00
   * 6. Having that, the result should be the index of the last part is 3 (not 2)
   */
  const finalizedDiscreteOrders = discreteOrders.filter((order) => getIsFinalizedOrder(order))
  const lastOrderValidTo = finalizedDiscreteOrders.reduce(
    (maxValidTo, { validTo }) => (validTo > maxValidTo ? validTo : maxValidTo),
    0
  )

  if (!lastOrderValidTo) return partsPassed

  const lastOrderIndex = Math.ceil((lastOrderValidTo - startTime) / timeInterval)

  return Math.min(Math.max(lastOrderIndex, partsPassed), numOfParts)
}
