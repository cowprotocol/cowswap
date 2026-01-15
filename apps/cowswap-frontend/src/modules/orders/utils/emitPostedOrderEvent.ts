import { getIsNativeToken } from '@cowprotocol/common-utils'
import { NATIVE_CURRENCY_ADDRESS, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents, OnPostedOrderPayload } from '@cowprotocol/events'
import { TokenInfo, UiOrderType } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'
import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import { OrderStatusEvents } from '../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../events/orderStatusEventEmitter'

interface PendingOrderNotificationParams {
  chainId: SupportedChainId
  id: string
  owner: string
  kind: OrderKind
  uiOrderType: UiOrderType
  receiver: Nullish<string>
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  orderCreationHash?: string
  isEthFlow?: boolean
}

export function emitPostedOrderEvent(params: PendingOrderNotificationParams): void {
  const { chainId, id, receiver, owner, uiOrderType, orderCreationHash, inputAmount, outputAmount, isEthFlow } = params

  const postedOrderPayload: OnPostedOrderPayload = {
    orderUid: id,
    orderCreationHash,
    chainId,
    owner,
    kind: params.kind,
    orderType: uiOrderType,
    inputAmount: BigInt(inputAmount.quotient.toString()),
    outputAmount: BigInt(outputAmount.quotient.toString()),
    inputToken: currencyToTokenInfo(inputAmount.currency),
    outputToken: currencyToTokenInfo(outputAmount.currency),
    receiver: receiver || undefined,
    isEthFlow,
  }

  WIDGET_EVENT_EMITTER.emit(CowWidgetEvents.ON_POSTED_ORDER, postedOrderPayload)
  ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_POSTED_ORDER, {
    inputAmount,
    outputAmount,
    orderDetails: postedOrderPayload,
    isEthFlow,
  })
}

function currencyToTokenInfo(currency: Currency): TokenInfo {
  return (
    getIsNativeToken(currency)
      ? {
          ...currency,
          address: NATIVE_CURRENCY_ADDRESS,
        }
      : currency
  ) as TokenInfo
}
