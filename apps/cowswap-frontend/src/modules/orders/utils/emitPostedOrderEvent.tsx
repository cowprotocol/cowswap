import { TokenWithLogo } from '@cowprotocol/common-const'
import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowEvents, OnPostedOrderPayload } from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { EVENT_EMITTER } from 'eventEmitter'
import { Nullish } from 'types'

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

export function emitPostedOrderEvent(params: PendingOrderNotificationParams) {
  const {
    chainId,
    id,
    receiver,
    owner,
    uiOrderType,
    orderCreationHash,
    inputAmount: _inputAmount,
    outputAmount: _outputAmount,
    isEthFlow,
  } = params

  const inputAmount = currencyAmountToTokenAmountIfNeeded(_inputAmount)
  const outputAmount = currencyAmountToTokenAmountIfNeeded(_outputAmount)
  const inputToken = inputAmount.currency
  const outputToken = outputAmount.currency

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
      ...inputToken,
      symbol: inputToken.symbol || '',
      name: inputToken.name || '',
    },
    outputToken: {
      ...outputToken,
      symbol: outputToken.symbol || '',
      name: outputToken.name || '',
    },
    receiver: receiver || undefined,
    isEthFlow,
  }

  EVENT_EMITTER.emit(CowEvents.ON_POSTED_ORDER, postedOrderPayload)
}

/**
 * currencyAmountToTokenAmount converts native token to wrapped
 * but here we don't want to convert wrapped token to native
 */
function currencyAmountToTokenAmountIfNeeded(amount: CurrencyAmount<Currency>): CurrencyAmount<Token> {
  return amount.currency instanceof TokenWithLogo
    ? (amount as CurrencyAmount<TokenWithLogo>)
    : currencyAmountToTokenAmount(amount)
}
