/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { CurrencyAmount, Price } from '@uniswap/sdk-core'

import { useSetIsOrderUnfillable } from 'legacy/state/orders/hooks'
import { getEstimatedExecutionPrice, getOrderMarketPrice, isOrderUnfillable } from 'legacy/state/orders/utils'

import { updatePendingOrderPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'

import { GenericOrder } from 'common/types'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { usePriceOutOfRangeAnalytics } from './usePriceOutOfRangeAnalytics'

export function useUpdateIsUnfillableFlag(): (
  chainId: SupportedChainId,
  order: GenericOrder,
  priceAmount: string,
  fee: string,
) => void {
  const updatePendingOrderPrices = useSetAtom(updatePendingOrderPricesAtom)
  const setIsOrderUnfillable = useSetIsOrderUnfillable()
  const priceOutOfRangeAnalytics = usePriceOutOfRangeAnalytics()

  return useCallback(
    (chainId: SupportedChainId, order: GenericOrder, priceAmount: string, fee: string) => {
      const orderPrice = new Price(
        order.inputToken,
        order.outputToken,
        order.sellAmount.toString(),
        order.buyAmount.toString(),
      )

      const marketPrice = getOrderMarketPrice(order, priceAmount, fee)
      const estimatedExecutionPrice = getEstimatedExecutionPrice(order, marketPrice, fee)

      const isSwap = getUiOrderType(order) === UiOrderType.SWAP
      const isUnfillable = isSwap && isOrderUnfillable(order, orderPrice, marketPrice)

      // Only trigger state update if flag changed
      if (order.isUnfillable !== isUnfillable && isSwap) {
        setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })

        // order.isUnfillable by default is undefined, so we don't want to dispatch this in that case
        if (typeof order.isUnfillable !== 'undefined') {
          const label = `${order.inputToken.symbol}, ${order.outputToken.symbol}`
          priceOutOfRangeAnalytics(label)
        }
      }

      updatePendingOrderPrices({
        orderId: order.id,
        data: {
          lastUpdateTimestamp: Date.now(),
          marketPrice,
          estimatedExecutionPrice,
          feeAmount: CurrencyAmount.fromRawAmount(marketPrice.baseCurrency, fee),
        },
      })
    },
    [setIsOrderUnfillable, updatePendingOrderPrices, priceOutOfRangeAnalytics],
  )
}
