import { useMemo } from 'react'

import { ORDER_BOOK_API_UPDATE_INTERVAL, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { logTwap, normalizeError } from '@cowprotocol/common-utils'
import {
  type EnrichedOrder,
  OrderClass,
  OrderKind,
  OrderStatus as SdkOrderStatus,
  SigningScheme,
  type UID,
} from '@cowprotocol/cow-sdk'
import type { TwapPartOrder, TwapPartOrderStatus } from '@cowprotocol/sdk-composable'

import useSWR from 'swr'

import { OrderStatus, type Order } from 'legacy/state/orders/actions'

import { ORDERS_TABLE_PAGE_SIZE } from 'modules/ordersTable'

import { parseOrder, type ParsedOrder } from 'utils/orderUtils/parseOrder'

import { programmaticOrdersApi } from '../services/programmaticOrdersApi'
import { type TwapOrderItem } from '../types'

interface EoaTwapPartOrdersResult {
  orders: ParsedOrder[]
  isLoading: boolean
}

export function useEoaTwapPartOrders(
  twapOrder: TwapOrderItem | null,
  parent: ParsedOrder,
  page: number,
  enabled: boolean,
): EoaTwapPartOrdersResult {
  const partOrdersCount = twapOrder?.partOrdersCount ?? 0
  const { data: partPage, isLoading } = useSWR(
    enabled && twapOrder && partOrdersCount > 0
      ? ([
          'eoa-twap-part-orders',
          twapOrder.id,
          twapOrder.chainId,
          page,
          ORDERS_TABLE_PAGE_SIZE,
          partOrdersCount,
          twapOrder.status,
          twapOrder.executionInfo,
        ] as const)
      : null,
    async ([, eventId, chainId, page, pageSize]) => {
      try {
        const partPage = await programmaticOrdersApi.fetchEoaTwapPartOrders(eventId, chainId, page, pageSize)
        logTwap.debug('Fetched EOA TWAP part orders', {
          orderCount: partPage.items.length,
          page,
        })

        return partPage
      } catch (err: unknown) {
        const error = normalizeError(err)

        logTwap.error(error, {
          chainId: String(chainId),
          page: String(page),
        })

        throw error
      }
    },
    {
      ...SWR_NO_REFRESH_OPTIONS,
      refreshInterval: ORDER_BOOK_API_UPDATE_INTERVAL,
      shouldRetryOnError: false,
    },
  )

  return useMemo(() => {
    if (!partPage || !twapOrder) return { orders: [], isLoading }

    // `index` starts at 0 on every page. Add the number of parts on earlier pages
    // to find its position in the full TWAP: page 2, index 2 is the 13th part.
    const offset = (page - 1) * ORDERS_TABLE_PAGE_SIZE

    return {
      // Convert API part orders into table orders and mark the final TWAP part.
      orders: partPage.items.map((partOrder, index) =>
        mapPartOrder(partOrder, twapOrder, parent, offset + index === partPage.totalCount - 1),
      ),
      isLoading,
    }
  }, [isLoading, page, parent, partPage, twapOrder])
}

function mapApiAdditionalInfo(
  partOrder: TwapPartOrder,
  twapOrder: TwapOrderItem,
  parent: ParsedOrder,
  creationTime: string,
): Omit<EnrichedOrder, 'settlementContract'> {
  const executedSellAmount = (partOrder.executedSellAmount ?? 0n).toString()
  const executedBuyAmount = (partOrder.executedBuyAmount ?? 0n).toString()
  const executedFeeAmount = (partOrder.executedFeeAmount ?? 0n).toString()
  const validTo = partOrder.validTo ?? Math.ceil(parent.expirationTime.getTime() / 1000)

  return {
    sellToken: twapOrder.order.sellToken,
    buyToken: twapOrder.order.buyToken,
    receiver: twapOrder.order.receiver,
    sellAmount: partOrder.sellAmount.toString(),
    buyAmount: partOrder.buyAmount.toString(),
    validTo,
    appData: twapOrder.order.appData,
    feeAmount: partOrder.feeAmount.toString(),
    kind: OrderKind.SELL,
    partiallyFillable: false,
    signature: '',
    signingScheme: SigningScheme.EIP1271,
    class: OrderClass.LIMIT,
    status: mapSdkPartOrderStatus(partOrder.status),
    creationDate: creationTime,
    owner: twapOrder.safeAddress,
    uid: partOrder.orderUid,
    executedSellAmount,
    executedSellAmountBeforeFees: executedSellAmount,
    executedBuyAmount,
    executedFeeAmount,
    totalFee: executedFeeAmount,
    invalidated: false,
  }
}

function mapLegacyPartOrderStatus(status: TwapPartOrderStatus): OrderStatus {
  if (status === 'open') return OrderStatus.PENDING
  if (status === 'fulfilled') return OrderStatus.FULFILLED
  if (status === 'cancelled') return OrderStatus.CANCELLED

  return OrderStatus.EXPIRED
}

function mapPartOrder(
  partOrder: TwapPartOrder,
  twapOrder: TwapOrderItem,
  parent: ParsedOrder,
  isTheLastPart: boolean,
): ParsedOrder {
  const creationTime = new Date(partOrder.createdAt * 1000).toISOString()
  const apiAdditionalInfo = mapApiAdditionalInfo(partOrder, twapOrder, parent, creationTime)
  const order = {
    ...apiAdditionalInfo,
    id: partOrder.orderUid as UID,
    status: mapLegacyPartOrderStatus(partOrder.status),
    creationTime,
    isEoaTwapOrder: true,
    sellAmountBeforeFee: partOrder.sellAmount.toString(),
    inputToken: parent.inputToken,
    outputToken: parent.outputToken,
    fullAppData: parent.fullAppData,
    composableCowInfo: {
      isVirtualPart: false,
      isTheLastPart,
      parentId: twapOrder.id,
    },
    apiAdditionalInfo,
  } satisfies Order

  return parseOrder(order)
}

function mapSdkPartOrderStatus(status: TwapPartOrderStatus): SdkOrderStatus {
  if (status === 'open') return SdkOrderStatus.OPEN
  if (status === 'fulfilled') return SdkOrderStatus.FULFILLED
  if (status === 'cancelled') return SdkOrderStatus.CANCELLED

  return SdkOrderStatus.EXPIRED
}
