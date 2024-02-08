import { useCallback } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { CONFIRMED_STATES, Order } from 'legacy/state/orders/actions'

import { Routes, RoutesValues } from 'common/constants/routes'
import { getUiOrderType, UiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { useTradeNavigate } from './useTradeNavigate'

const ORDER_TYPE_TO_ROUTE: Record<UiOrderType, RoutesValues> = {
  SWAP: Routes.SWAP,
  LIMIT: Routes.LIMIT_ORDER,
  TWAP: Routes.ADVANCED_ORDERS,
}

export function useGetCopyToNewCallback(): (order: Order | ParsedOrder | undefined) => undefined | (() => void) {
  return useCopyToNew
}

export function useCopyToNew(order: Order | ParsedOrder | undefined): undefined | (() => void) {
  const navigate = useTradeNavigate()
  const { chainId } = useWalletInfo()

  const orderType = order && getUiOrderType(order)
  const route = orderType && ORDER_TYPE_TO_ROUTE[orderType]

  const { kind, inputToken, outputToken, sellAmount, buyAmount, feeAmount, status } = order || {}

  const inputCurrencyId = inputToken?.address
  const outputCurrencyId = outputToken?.address

  // Only return callback if order is in a final state
  const canRecreateOrder = status && CONFIRMED_STATES.includes(status)

  // Load CurrencyAmount instances for parsing the amounts in units rather than atoms
  const inputAmount = inputToken && sellAmount && CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
  const outputAmount = outputToken && buyAmount && CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())
  const fee = inputToken && feeAmount && CurrencyAmount.fromRawAmount(inputToken, feeAmount.toString())
  const totalInputAmount = inputAmount && fee && inputAmount.add(fee)

  // Get the currencyAmount according to order kind
  const currencyAmount = kind === OrderKind.SELL ? totalInputAmount : outputAmount
  // Get the amount units
  const amount =
    orderType !== UiOrderType.LIMIT && currencyAmount
      ? currencyAmount.toFixed(kind === OrderKind.SELL ? inputToken?.decimals : outputToken?.decimals)
      : undefined
  const totalSellAmount = totalInputAmount && totalInputAmount.toFixed(inputToken?.decimals)
  const totalBuyAmount = outputAmount && outputAmount.toFixed(outputToken?.decimals)

  const recreateOrder = useCallback(() => {
    if (
      !chainId ||
      !canRecreateOrder ||
      !inputCurrencyId ||
      !outputCurrencyId ||
      !kind ||
      !orderType ||
      !route ||
      (!amount && !totalSellAmount && !totalBuyAmount)
    ) {
      return
    }

    // Move to route with order details filled in
    navigate(
      chainId,
      {
        inputCurrencyId,
        outputCurrencyId,
      },
      { kind, amount, sellAmount: totalSellAmount, buyAmount: totalBuyAmount },
      route
    )
  }, [
    amount,
    canRecreateOrder,
    chainId,
    inputCurrencyId,
    kind,
    navigate,
    orderType,
    outputCurrencyId,
    route,
    totalBuyAmount,
    totalSellAmount,
  ])

  return canRecreateOrder ? recreateOrder : undefined
}
