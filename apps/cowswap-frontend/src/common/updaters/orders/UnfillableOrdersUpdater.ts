import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { isSellOrder } from '@cowprotocol/common-utils'
import { SupportedChainId, AccountAddress, QuoteResults } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { Order } from 'legacy/state/orders/actions'
import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'legacy/state/orders/consts'
import { useOnlyPendingOrders, useSetIsOrderUnfillable } from 'legacy/state/orders/hooks'
import {
  getEstimatedExecutionPrice,
  getOrderMarketPrice,
  getRemainderAmount,
  isOrderUnfillable,
} from 'legacy/state/orders/utils'

import { updatePendingOrderPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useIsProviderNetworkUnsupported } from '../../hooks/useIsProviderNetworkUnsupported'

/**
 * Updater that checks whether pending orders are still "fillable"
 */
// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function UnfillableOrdersUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const updatePendingOrderPrices = useSetAtom(updatePendingOrderPricesAtom)
  const isWindowVisible = useIsWindowVisible()
  const cowAnalytics = useCowAnalytics()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const pending = useOnlyPendingOrders(chainId)

  const setIsOrderUnfillable = useSetIsOrderUnfillable()

  const { values: balances } = useTokensBalances()

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises

  const priceOutOfRangeAnalytics = useCallback(
    (label: string) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action: 'Price out of range',
        label,
      })
    },
    [cowAnalytics],
  )

  const updateOrderMarketPriceCallback = useCallback(
    (
      order: Order,
      fee: string | null,
      marketPrice: Price<Currency, Currency>,
      estimatedExecutionPrice: Price<Currency, Currency> | null,
    ) => {
      if (!fee) return

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
    [updatePendingOrderPrices],
  )

  const updateIsUnfillableFlag = useCallback(
    (chainId: SupportedChainId, order: Order, priceAmount: string, fee: string | null) => {
      if (!fee) return

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

      updateOrderMarketPriceCallback(order, fee, marketPrice, estimatedExecutionPrice)
    },
    [setIsOrderUnfillable, updateOrderMarketPriceCallback, priceOutOfRangeAnalytics],
  )

  const balancesRef = useRef(balances)
  balancesRef.current = balances

  const updatePending = useCallback(() => {
    if (!chainId || !account || isUpdating.current || !isWindowVisible) {
      return
    }

    try {
      isUpdating.current = true

      const lowerCaseAccount = account.toLowerCase()
      // Only check pending orders of the connected account
      const pending = pendingRef.current.filter((order) => order.owner.toLowerCase() === lowerCaseAccount)

      if (pending.length === 0) {
        return
      }

      pending.forEach((order) => {
        getOrderPrice(chainId, order)
          .then((results) => {
            if (!results) return

            const {
              quoteResponse: { quote },
            } = results

            const amount = isSellOrder(quote.kind) ? quote.buyAmount : quote.sellAmount

            updateIsUnfillableFlag(chainId, order, amount, quote.feeAmount)
          })
          .catch((e) => {
            updatePendingOrderPrices({
              orderId: order.id,
              data: null,
            })

            console.debug(
              `[UnfillableOrdersUpdater::updateUnfillable] Failed to get quote on chain ${chainId} for order ${order?.id}`,
              e,
            )
          })
      })
    } finally {
      isUpdating.current = false
    }
  }, [account, chainId, updateIsUnfillableFlag, isWindowVisible, updatePendingOrderPrices])

  const updatePendingRef = useRef(updatePending)
  updatePendingRef.current = updatePending

  useEffect(() => {
    if (!chainId || !account || !isWindowVisible || isProviderNetworkUnsupported) {
      return
    }

    updatePendingRef.current()
    const interval = setInterval(() => updatePendingRef.current(), PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [chainId, account, isWindowVisible, isProviderNetworkUnsupported])

  return null
}

async function getOrderPrice(chainId: SupportedChainId, order: Order): Promise<QuoteResults | null> {
  const amount = getRemainderAmount(order.kind, order)

  try {
    return tradingSdk
      .getQuote({
        chainId,
        kind: order.kind,
        owner: order.owner as AccountAddress,
        sellToken: order.sellToken,
        sellTokenDecimals: order.inputToken.decimals,
        buyToken: order.buyToken,
        buyTokenDecimals: order.outputToken.decimals,
        amount,
        receiver: order.receiver,
        partiallyFillable: order.partiallyFillable,
      })
      .then((res) => res.quoteResults)
  } catch {
    return null
  }
}
