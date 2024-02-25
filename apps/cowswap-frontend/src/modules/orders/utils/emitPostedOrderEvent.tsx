import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowEvents, OnPostedOrderPayload } from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { EVENT_EMITTER } from 'eventEmitter'
import { Nullish } from 'types'

interface PendingOrderNotificationParams {
  chainId: SupportedChainId
  id: string
  owner: string
  kind: OrderKind
  uiOrderType: UiOrderType
  receiver: Nullish<string>
  inputAmount: CurrencyAmount<Token>
  outputAmount: CurrencyAmount<Token>
  orderCreationHash?: string
  isEthFlow?: boolean
}

export function emitPostedOrderEvent(params: PendingOrderNotificationParams) {
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
    inputToken: {
      ...inputAmount.currency,
      symbol: inputAmount.currency.symbol || '',
      name: inputAmount.currency.name || '',
    },
    outputToken: {
      ...outputAmount.currency,
      symbol: outputAmount.currency.symbol || '',
      name: outputAmount.currency.name || '',
    },
    receiver: receiver || undefined,
    isEthFlow,
  }

  EVENT_EMITTER.emit(CowEvents.ON_POSTED_ORDER, postedOrderPayload)
}
