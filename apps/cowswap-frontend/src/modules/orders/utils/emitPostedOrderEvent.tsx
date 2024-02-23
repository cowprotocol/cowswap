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
  isHidden?: boolean
}

export function emitPostedOrderEvent(params: PendingOrderNotificationParams) {
  const { chainId, id, receiver, owner, uiOrderType, orderCreationHash, isHidden, inputAmount, outputAmount } = params

  if (!isHidden) {
    const postedOrderPayload: OnPostedOrderPayload = {
      orderUid: orderCreationHash || id,
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
    }

    EVENT_EMITTER.emit(CowEvents.ON_POSTED_ORDER, postedOrderPayload)
  }
}
