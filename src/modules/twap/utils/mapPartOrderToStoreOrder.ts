import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { Order } from 'legacy/state/orders/actions'
import { computeOrderSummary } from 'legacy/state/orders/updaters/utils'

import { TokensByAddress } from 'modules/tokensList/state/tokensListAtom'
import { getTokensByAddress } from 'modules/tokensList/utils/getTokensByAddress'

import { getIsLastPartOrder } from './getIsLastPartOrder'
import { getPartOrderStatus } from './getPartOrderStatus'

import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'

export function mapPartOrderToStoreOrder(
  item: TwapPartOrderItem,
  enrichedOrder: EnrichedOrder,
  isVirtualPart: boolean,
  parent: TwapOrderItem,
  tokensByAddress: TokensByAddress
): Order {
  const chainId = item.chainId
  const isCancelling = parent.status === TwapOrderStatus.Cancelling || enrichedOrder.invalidated
  const status = getPartOrderStatus(enrichedOrder, parent, isVirtualPart)

  const storeOrder: Order = {
    ...enrichedOrder,
    id: enrichedOrder.uid,
    composableCowInfo: {
      isVirtualPart,
      isTheLastPart: getIsLastPartOrder(item, parent),
      parentId: parent.id,
    },
    sellAmountBeforeFee: enrichedOrder.sellAmount,
    inputToken: getTokensByAddress(chainId, enrichedOrder.sellToken, tokensByAddress),
    outputToken: getTokensByAddress(chainId, enrichedOrder.buyToken, tokensByAddress),
    creationTime: enrichedOrder.creationDate,
    summary: '',
    status,
    apiAdditionalInfo: enrichedOrder,
    isCancelling,
  }

  const summary = computeOrderSummary({ orderFromStore: storeOrder, orderFromApi: enrichedOrder })

  storeOrder.summary = summary || ''

  return storeOrder
}
