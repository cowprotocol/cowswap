import { logTwap } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'
import type { QueryPage, TwapPartOrder } from '@cowprotocol/sdk-composable'

import { getTwapOrderStatus } from '../utils/getTwapOrderStatus'

import type { TWAPOrderStruct } from '../types'
import type { TwapOrdersList } from 'entities/twap'

const PROGRAMMATIC_ORDERS_API_URL =
  process.env.REACT_APP_PROGRAMMATIC_ORDERS_API_URL || 'https://programmatic-orders.cow.fi/'

class ProgrammaticOrdersApi {
  private readonly api = new ProgrammaticOrderApi({ apiUrl: PROGRAMMATIC_ORDERS_API_URL })

  async fetchEoaTwapOrders(
    resolvedOwner: string,
    chainId: SupportedChainId,
    limit: number,
  ): Promise<{ orders: TwapOrdersList; totalCount: number }> {
    const { items: twapOrders, totalCount } = await this.api.getTwapOrders(
      { resolvedOwner, chainId },
      { direction: 'desc', limit },
    )
    const orders = twapOrders.reduce<TwapOrdersList>((result, twapOrder) => {
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

      result[twapOrder.eventId] = {
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

      return result
    }, {})

    logTwap.debug('Fetched EOA TWAP orders', {
      chainId,
      orderCount: Object.keys(orders).length,
    })

    return { orders, totalCount }
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
}

export const programmaticOrdersApi = new ProgrammaticOrdersApi()
