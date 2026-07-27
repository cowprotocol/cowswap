import { logTwap } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { getTwapOrderStatus } from '../utils/getTwapOrderStatus'

import type { TwapOrderItem, TwapOrdersExecution, TWAPOrderStruct } from '../types'
import type { TwapOrdersList } from 'entities/twap'

const programmaticOrderApi = new ProgrammaticOrderApi()

export async function fetchEoaTwapOrders(
  resolvedOwner: string,
  chainId: SupportedChainId,
  limit: number,
): Promise<{ orders: TwapOrdersList; totalCount: number }> {
  const { items: twapOrders, totalCount } = await programmaticOrderApi.getTwapOrders(
    { resolvedOwner, chainId },
    { direction: 'desc', limit },
  )
  const orders = twapOrders.reduce<TwapOrdersList>((result, twapOrder) => {
    const order = mapTwapOrder(twapOrder)
    result[order.id] = order

    return result
  }, {})

  logTwap.debug('Fetched EOA TWAP orders', {
    chainId,
    orderCount: Object.keys(orders).length,
  })

  return { orders, totalCount }
}

function getExecutionInfo(twapOrder: TwapOrder): TwapOrdersExecution {
  const confirmedPartsCount =
    twapOrder.status === 'Completed' ? toSafeNumber(twapOrder.schedule.numberOfParts, 'numberOfParts') : 0

  return {
    confirmedPartsCount,
    info: {
      executedSellAmount: twapOrder.executedAmounts.executedSellAmount.toString(),
      executedBuyAmount: twapOrder.executedAmounts.executedBuyAmount.toString(),
      executedFeeAmount: twapOrder.executedAmounts.executedFeeAmount.toString(),
    },
  }
}

function mapSchedule({ schedule }: TwapOrder): TWAPOrderStruct {
  return {
    sellToken: schedule.sellToken,
    buyToken: schedule.buyToken,
    receiver: schedule.receiver,
    partSellAmount: schedule.partSellAmount.toString(),
    minPartLimit: schedule.minPartLimit.toString(),
    t0: toSafeNumber(schedule.effectiveStartTime, 'effectiveStartTime'),
    n: toSafeNumber(schedule.numberOfParts, 'numberOfParts'),
    t: toSafeNumber(schedule.timeBetweenParts, 'timeBetweenParts'),
    span: toSafeNumber(schedule.durationOfPart, 'durationOfPart'),
    appData: schedule.appData,
  }
}

function mapTwapOrder(twapOrder: TwapOrder): TwapOrderItem {
  const order = mapSchedule(twapOrder)
  const executionInfo = getExecutionInfo(twapOrder)
  const createdAt = new Date(twapOrder.createdAt * 1000)

  return {
    id: twapOrder.eventId,
    hash: twapOrder.hash,
    chainId: twapOrder.chainId,
    safeAddress: twapOrder.owner,
    resolvedOwner: twapOrder.resolvedOwner,
    order,
    status: getTwapOrderStatus(order, true, createdAt, twapOrder.status !== 'Cancelled', executionInfo),
    submissionDate: createdAt.toISOString(),
    executedDate: createdAt.toISOString(),
    partOrdersCount: twapOrder.partOrdersCount,
    executionInfo,
  }
}

function toSafeNumber(value: bigint, field: string): number {
  const number = Number(value)

  if (!Number.isSafeInteger(number)) {
    throw new RangeError(`TWAP ${field} is outside the safe integer range`)
  }

  return number
}
