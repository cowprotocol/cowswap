import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { Order, OrderInfoApi } from 'legacy/state/orders/actions'
import { useOrdersById } from 'legacy/state/orders/hooks'

import { useWalletInfo } from 'modules/wallet'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderExecutionInfo } from '../types'

export type TwapOrdersExecutionMap = { [id: string]: TwapOrderExecutionInfo }

type PartsIdsInfo = {
  sets: { [id: string]: Set<string> }
  ids: string[]
}

export function useTwapOrdersExecutions(ids: string[]): TwapOrdersExecutionMap {
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

  const allPartOrdersMap = useOrdersById({ chainId, ids: allPartIds })

  const allPartOrders = useMemo(() => {
    if (!allPartOrdersMap) return []

    return Object.values(allPartOrdersMap)
  }, [allPartOrdersMap])

  return useMemo(() => {
    return ids.reduce<TwapOrdersExecutionMap>((acc, id) => {
      const childrenIds = partSets[id]

      if (childrenIds?.size > 0) {
        const children = allPartOrders.filter((order) => childrenIds.has(order.id))

        const executedBuyAmount = sumChildrenAmount(children, 'executedBuyAmount').toString()
        const executedSellAmount = sumChildrenAmount(children, 'executedSellAmount').toString()
        const executedFeeAmount = sumChildrenAmount(children, 'executedFeeAmount').toString()

        acc[id] = { executedSellAmount, executedFeeAmount, executedBuyAmount }
      } else {
        acc[id] = DEFAULT_TWAP_EXECUTION_INFO
      }

      return acc
    }, {})
  }, [ids, partSets, allPartOrders])
}

function sumChildrenAmount(children: Order[], key: keyof OrderInfoApi): BigInt {
  return children.reduce((acc, order) => {
    return acc + BigInt((order.apiAdditionalInfo?.[key] || '0') as string)
  }, BigInt(0))
}
