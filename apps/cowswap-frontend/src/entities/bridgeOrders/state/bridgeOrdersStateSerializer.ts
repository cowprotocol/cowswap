import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { PersistentStateByChainAccount } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import type { BridgeQuoteAmounts } from 'common/types/bridge'

import { SerializedAmount } from '../types'

export function bridgeOrdersStateSerializer<T, Q, R extends PersistentStateByChainAccount<Q[]>>(
  state: PersistentStateByChainAccount<T[]>,
  mappingFunction: (item: T) => Q,
): R {
  return Object.keys(state).reduce<Partial<R>>((acc, _chainId) => {
    const chainId = +_chainId as SupportedChainId
    const chainState = state[chainId]

    if (!chainState) return acc

    const deserializedChainState = Object.keys(chainState).reduce<Record<string, Q[]>>((acc2, account) => {
      const orders = chainState[account]

      if (!orders?.length) return acc2

      acc2[account] = orders.map(mappingFunction)

      return acc2
    }, {})

    acc[chainId] = deserializedChainState

    return acc
  }, {}) as R
}

export function serializeQuoteAmounts(amounts: BridgeQuoteAmounts): BridgeQuoteAmounts<SerializedAmount> {
  return {
    swapSellAmount: serializeAmount(amounts.swapSellAmount),
    swapBuyAmount: serializeAmount(amounts.swapBuyAmount),
    swapMinReceiveAmount: serializeAmount(amounts.swapMinReceiveAmount),
    bridgeMinReceiveAmount: serializeAmount(amounts.bridgeMinReceiveAmount),
    bridgeFee: serializeAmount(amounts.bridgeFee),
  }
}

export function deserializeQuoteAmounts(amounts: BridgeQuoteAmounts<SerializedAmount>): BridgeQuoteAmounts {
  return {
    swapSellAmount: deserializeAmount(amounts.swapSellAmount),
    swapBuyAmount: deserializeAmount(amounts.swapBuyAmount),
    swapMinReceiveAmount: deserializeAmount(amounts.swapMinReceiveAmount),
    bridgeMinReceiveAmount: deserializeAmount(amounts.bridgeMinReceiveAmount),
    bridgeFee: deserializeAmount(amounts.bridgeFee),
  }
}

function serializeAmount(amount: CurrencyAmount<Currency | TokenWithLogo>): SerializedAmount {
  return {
    amount: amount.quotient.toString(),
    token: {
      logoURI: (amount.currency as TokenWithLogo).logoURI,
      chainId: amount.currency.chainId,
      address: getCurrencyAddress(amount.currency),
      decimals: amount.currency.decimals,
      symbol: amount.currency.symbol || '',
      name: amount.currency.name || '',
    },
  }
}

function deserializeAmount(amount: SerializedAmount): CurrencyAmount<Currency | TokenWithLogo> {
  const token = TokenWithLogo.fromToken(amount.token, amount.token.logoURI)

  return CurrencyAmount.fromRawAmount(token, amount.amount)
}
