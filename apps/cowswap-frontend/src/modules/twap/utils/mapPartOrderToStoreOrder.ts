import { EnrichedOrder } from '@cowprotocol/cow-sdk'
import { TokensByAddress } from '@cowprotocol/tokens'

import { Order } from 'legacy/state/orders/actions'

import { getIsLastPartOrder } from './getIsLastPartOrder'
import { getPartOrderStatus } from './getPartOrderStatus'

import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'

export function mapPartOrderToStoreOrder(
  item: TwapPartOrderItem,
  enrichedOrder: EnrichedOrder,
  isVirtualPart: boolean,
  parent: TwapOrderItem,
  tokensByAddress: TokensByAddress,
): Order | null {
  const isCancelling = item.isCancelling || parent.status === TwapOrderStatus.Cancelling
  const status = getPartOrderStatus(enrichedOrder, parent, isVirtualPart)

  const inputToken = tokensByAddress[enrichedOrder.sellToken.toLowerCase()]
  const outputToken = tokensByAddress[enrichedOrder.buyToken.toLowerCase()]

  if (!inputToken || !outputToken) return null

  return {
    ...enrichedOrder,
    id: enrichedOrder.uid,
    composableCowInfo: {
      isVirtualPart,
      isTheLastPart: getIsLastPartOrder(item, parent),
      parentId: parent.id,
    },
    sellAmountBeforeFee: enrichedOrder.sellAmount,
    inputToken,
    outputToken,
    creationTime: enrichedOrder.creationDate,
    status,
    apiAdditionalInfo: enrichedOrder,
    isCancelling,
  }
}
