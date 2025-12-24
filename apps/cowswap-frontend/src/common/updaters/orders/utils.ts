import {
  areAddressesEqual,
  formatSymbol,
  formatTokenAmount,
  isSellOrder,
  shortenAddress,
} from '@cowprotocol/common-utils'
import { EnrichedOrder, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import JSBI from 'jsbi'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { classifyOrder, OrderTransitionStatus } from 'legacy/state/orders/utils'

import { getOrder } from 'api/cowProtocol'
import { getIsComposableCowChildOrder } from 'utils/orderUtils/getIsComposableCowChildOrder'
import { getUiOrderType, getUiOrderTypeTitles, UiOrderTypeParams } from 'utils/orderUtils/getUiOrderType'

export function computeOrderSummary({
  orderFromStore,
  orderFromApi,
}: {
  orderFromStore: Order
  orderFromApi: Nullish<EnrichedOrder>
}): string | undefined {
  const genericOrder = orderFromApi ?? orderFromStore

  const owner = genericOrder?.owner
  const receiver = genericOrder?.receiver
  const uiOrderType = getUiOrderType(genericOrder as UiOrderTypeParams)
  const orderTitle = getUiOrderTypeTitles()[uiOrderType]

  const recipientSuffix = receiver && !areAddressesEqual(receiver, owner) ? t`to` + ` ${shortenAddress(receiver)}` : ''

  const { inputToken, outputToken } = orderFromStore
  const executedBuyAmount = orderFromStore.apiAdditionalInfo?.executedBuyAmount
  const executedSellAmount = orderFromStore.apiAdditionalInfo?.executedSellAmount

  const summaryAmounts = getOrderSummaryAmounts(
    genericOrder,
    inputToken,
    outputToken,
    executedBuyAmount,
    executedSellAmount,
  )

  // ${Swap} ${10 DAI at least 10 USDC} ${to 0x000..aaa}
  return `${orderTitle} ${summaryAmounts} ${recipientSuffix}`.trim()
}

function stringToCurrency(amount: string, currency: Currency): CurrencyAmount<Currency> {
  return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(amount))
}

function getOrderSummaryAmounts(
  genericOrder: EnrichedOrder | Order,
  inputToken: Token,
  outputToken: Token,
  executedBuyAmount: string | undefined,
  executedSellAmount: string | undefined,
): string {
  const { status, kind } = genericOrder

  const sellAmount = genericOrder.sellAmount
  const feeAmount = genericOrder.feeAmount
  const buyAmount = genericOrder.buyAmount
  const isFulfilled = status === OrderStatus.FULFILLED && executedBuyAmount && executedSellAmount

  if (isFulfilled) {
    // don't show amounts in atoms
    const inputAmount = stringToCurrency(executedSellAmount, inputToken)
    const outputAmount = stringToCurrency(executedBuyAmount, outputToken)

    return `${stringifyAmount(inputAmount)} ` + t`for` + ` ${stringifyAmount(outputAmount)}`
  } else {
    // sellAmount doesn't include the fee, so we add it back to not show a different value when the order is traded
    const inputAmount = stringToCurrency(sellAmount, inputToken).add(stringToCurrency(feeAmount, inputToken))
    const outputAmount = stringToCurrency(buyAmount, outputToken)

    const isSell = isSellOrder(kind)

    const inputPrefix = !isSell ? t`at most` + ` ` : ''
    const outputPrefix = isSell ? t`at least` + ` ` : ''

    return (
      `${inputPrefix}${stringifyAmount(inputAmount)} ` + t`for` + ` ${outputPrefix}${stringifyAmount(outputAmount)}`
    )
  }
}

function stringifyAmount(amount: CurrencyAmount<Currency>): string {
  return `${formatTokenAmount(amount)} ${formatSymbol(amount.currency.symbol)}`
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
