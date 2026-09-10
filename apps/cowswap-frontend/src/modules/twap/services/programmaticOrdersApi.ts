import { logTwap } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'
import type { QueryPage, TwapOrder, TwapPartOrder } from '@cowprotocol/sdk-composable'

import { getTwapOrderStatus } from '../utils/getTwapOrderStatus'

import type { TWAPOrderStruct } from '../types'
import type { TwapOrdersList } from 'entities/twap'

const PROGRAMMATIC_ORDERS_API_URL =
  process.env.REACT_APP_PROGRAMMATIC_ORDERS_API_URL || 'https://programmatic-orders.cow.fi/'

type EoaTwapOrdersDelta = Omit<EoaTwapOrdersResult, 'totalCount'>

interface EoaTwapOrdersResult {
  orders: TwapOrdersList
  totalCount: number
  updatedAtBlock: string
}

class ProgrammaticOrdersApi {
  private readonly api = new ProgrammaticOrderApi({ apiUrl: PROGRAMMATIC_ORDERS_API_URL })

  async fetchEoaTwapOrders(
    resolvedOwner: string,
    chainId: SupportedChainId,
    limit: number,
  ): Promise<EoaTwapOrdersResult> {
    const { items: twapOrders, totalCount } = await this.api.getTwapOrders(
      { resolvedOwner, chainId },
      { direction: 'desc', limit },
    )
    const { orders, updatedAtBlock } = mapTwapOrders(twapOrders)

    logTwap.debug('Fetched EOA TWAP orders', {
      chainId,
      orderCount: Object.keys(orders).length,
    })

    return { orders, totalCount, updatedAtBlock }
  }

  async fetchChangedEoaTwapOrders(
    resolvedOwner: string,
    chainId: SupportedChainId,
    updatedAtBlock: string,
  ): Promise<EoaTwapOrdersDelta> {
    const cursor = BigInt(updatedAtBlock)
    const { items } = await this.api.getTwapOrders(
      { resolvedOwner, chainId, updatedAtBlockGte: cursor },
      { limit: 1000 },
    )

    logTwap.debug('Polled TWAP delta', items.length)

    return mapTwapOrders(items, cursor)
  }

  fetchEoaTwapPartOrders(
    eventId: string,
    chainId: SupportedChainId,
    page: number,
    pageSize: number,
  ): Promise<QueryPage<TwapPartOrder>> {
    return this.api.getTwapPartOrders(
      { eventId, chainId },
      {
        direction: 'asc',
        offset: (page - 1) * pageSize,
        limit: pageSize,
      },
    )
  }

  async fetchCurrentEoaTwapPartOrder(eventId: string, chainId: SupportedChainId): Promise<TwapPartOrder | undefined> {
    const { items } = await this.api.getTwapPartOrders(
      { eventId, chainId },
      {
        direction: 'desc',
        limit: 1,
      },
    )
    const latestPart = items[0]

    return latestPart?.status === 'open' ? latestPart : undefined
  }
}

function mapTwapOrders(twapOrders: TwapOrder[], updatedAtBlock = 0n): EoaTwapOrdersDelta {
  const orders: TwapOrdersList = {}
  for (const twapOrder of twapOrders) {
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

    orders[twapOrder.eventId] = {
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
      updatedAtBlock: twapOrder.updatedAtBlock.toString(),
      executionInfo,
    }

    if (twapOrder.updatedAtBlock > updatedAtBlock) updatedAtBlock = twapOrder.updatedAtBlock
  }

  return { orders, updatedAtBlock: updatedAtBlock.toString() }
}

export const programmaticOrdersApi = new ProgrammaticOrdersApi()
