import { logTwap } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { getTwapOrderStatus } from '../utils/getTwapOrderStatus'

import type { TwapOrderItem, TWAPOrderStruct } from '../types'
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

function mapTwapOrder(twapOrder: TwapOrder): TwapOrderItem {
  const { schedule, executedAmounts } = twapOrder
  const order: TWAPOrderStruct = {
    sellToken: schedule.sellToken,
    buyToken: schedule.buyToken,
    receiver: schedule.receiver,
    partSellAmount: schedule.partSellAmount.toString(),
    minPartLimit: schedule.minPartLimit.toString(),
    t0: schedule.effectiveStartTime,
    n: schedule.numberOfParts,
    t: schedule.timeBetweenParts,
    span: schedule.durationOfPart,
    appData: schedule.appData,
  }
  const executionInfo = {
    // TODO rename this to isCompleted, this is its only purpose and it is confusing to have a count of confirmed parts when we only ever use it as a boolean
    confirmedPartsCount: twapOrder.status === 'Completed' ? schedule.numberOfParts : 0,
    info: {
      executedSellAmount: executedAmounts.executedSellAmount.toString(),
      executedBuyAmount: executedAmounts.executedBuyAmount.toString(),
      executedFeeAmount: executedAmounts.executedFeeAmount.toString(),
    },
  }
  const createdAt = new Date(twapOrder.createdAt * 1000)

  return {
    id: twapOrder.eventId,
    hash: twapOrder.hash,
    chainId: twapOrder.chainId,
    safeAddress: twapOrder.owner,
    resolvedOwner: twapOrder.resolvedOwner,
    order,
    status: getTwapOrderStatus({
      execution: executionInfo,
      executionDate: createdAt,
      isCancelled: twapOrder.status === 'Cancelled',
      isWaitingForSignature: false,
      order,
    }),
    submissionDate: createdAt.toISOString(),
    executedDate: createdAt.toISOString(),
    partOrdersCount: twapOrder.partOrdersCount,
    executionInfo,
  }
}
