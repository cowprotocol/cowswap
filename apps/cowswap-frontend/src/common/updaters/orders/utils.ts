import { formatSymbol, formatTokenAmount, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import { EnrichedOrder, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { classifyOrder, OrderTransitionStatus } from 'legacy/state/orders/utils'

import { getOrder } from 'api/cowProtocol'
import { getIsComposableCowChildOrder } from 'utils/orderUtils/getIsComposableCowChildOrder'
import { getUiOrderType, ORDER_UI_TYPE_TITLES, UiOrderTypeParams } from 'utils/orderUtils/getUiOrderType'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function stringToCurrency(amount: string, currency: Currency) {
  return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(amount))
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
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
      inputAmount.currency.symbol,
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

    if (!order) return null

    const status = classifyOrder(order)

    return { status, order }
  } catch {
    console.debug(
      `[PendingOrdersUpdater] Failed to fetch order popup data on chain ${chainId} for order ${orderFromStore.id}`,
    )
    return null
  }
}
