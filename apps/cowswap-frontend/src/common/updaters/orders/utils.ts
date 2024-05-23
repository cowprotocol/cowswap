import { formatSymbol, formatTokenAmount, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import { EnrichedOrder, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { classifyOrder, OrderTransitionStatus } from 'legacy/state/orders/utils'
import { stringToCurrency } from 'legacy/state/swap/extension'

import { getOrder } from 'api/gnosisProtocol'
import { getIsComposableCowChildOrder } from 'utils/orderUtils/getIsComposableCowChildOrder'
import { getUiOrderType, ORDER_UI_TYPE_TITLES, UiOrderTypeParams } from 'utils/orderUtils/getUiOrderType'

export function computeOrderSummary({
  orderFromStore,
  orderFromApi,
}: {
  orderFromStore?: Order
  orderFromApi: EnrichedOrder | null
}) {
  if (!orderFromStore && !orderFromApi) return undefined

  const buyToken = orderFromApi?.buyToken || orderFromStore?.buyToken
  const sellToken = orderFromApi?.sellToken || orderFromStore?.sellToken
  const sellAmount = (orderFromApi?.sellAmount || orderFromStore?.sellAmount) as string
  const feeAmount = (orderFromApi?.feeAmount || orderFromStore?.feeAmount) as string
  const buyAmount = (orderFromApi?.buyAmount || orderFromStore?.buyAmount) as string
  const executedBuyAmount = (orderFromApi?.executedBuyAmount ||
    orderFromStore?.apiAdditionalInfo?.executedBuyAmount) as string
  const executedSellAmount = (orderFromApi?.executedSellAmount ||
    orderFromStore?.apiAdditionalInfo?.executedSellAmount) as string
  const owner = orderFromApi?.owner || orderFromStore?.owner
  const receiver = orderFromApi?.receiver || orderFromStore?.receiver

  const uiOrderType = getUiOrderType((orderFromStore || orderFromApi) as UiOrderTypeParams)
  const orderTitle = ORDER_UI_TYPE_TITLES[uiOrderType]

  let summary: string | undefined = undefined

  if (orderFromStore) {
    const { inputToken, outputToken, status, kind } = orderFromStore
    const isFulfilled = status === OrderStatus.FULFILLED

    if (!inputToken || !outputToken) return undefined

    // don't show amounts in atoms
    const inputAmount = isFulfilled
      ? stringToCurrency(executedSellAmount, inputToken)
      : // sellAmount doesn't include the fee, so we add it back to not show a different value when the order is traded
        stringToCurrency(sellAmount, inputToken).add(stringToCurrency(feeAmount, inputToken))
    const outputAmount = stringToCurrency(isFulfilled ? executedBuyAmount : buyAmount, outputToken)

    const isSell = isSellOrder(kind)

    const inputPrefix = !isFulfilled && !isSell ? 'at most ' : ''
    const outputPrefix = !isFulfilled && isSell ? 'at least ' : ''

    summary = `${orderTitle} ${inputPrefix}${formatTokenAmount(inputAmount)} ${formatSymbol(
      inputAmount.currency.symbol
    )} for ${outputPrefix}${formatTokenAmount(outputAmount)} ${formatSymbol(outputAmount.currency.symbol)}`
  } else {
    // We only have the API order info, let's at least use that
    summary = `${orderTitle} ${sellToken} for ${buyToken}`
  }

  if (owner && receiver && receiver !== owner) {
    summary += ` to ${shortenAddress(receiver)}`
  }

  return summary
}

type PopupData = {
  status: OrderTransitionStatus
  order: EnrichedOrder
}

export async function fetchAndClassifyOrder(orderFromStore: Order, chainId: ChainId): Promise<PopupData | null> {
  // Skip EthFlow creating orders
  if (orderFromStore.status === OrderStatus.CREATING) {
    return null
  }

  try {
    const isComposableCowChildOrder = getIsComposableCowChildOrder(orderFromStore)
    // For ComposableCow child orders always request PROD order-book
    const order = await getOrder(chainId, orderFromStore.id, isComposableCowChildOrder ? 'prod' : undefined)

    // TODO: remove after test
    if (
      order?.uid ===
      '0xfbc02116477e1d722ce60e5306fcbbd8c9738ca4541ccfbef72fd86db9dd4c98fb3c7eb936caa12b5a884d612393969a557d430766583061'
    ) {
      order.executedSellAmount = '499989000000000000'
      order.executedSellAmountBeforeFees = '499989000000000000'
      order.status = 'open' as any
    }

    if (!order) return null

    const status = classifyOrder(order)

    return { status, order }
  } catch (e: any) {
    console.debug(
      `[PendingOrdersUpdater] Failed to fetch order popup data on chain ${chainId} for order ${orderFromStore.id}`
    )
    return null
  }
}
