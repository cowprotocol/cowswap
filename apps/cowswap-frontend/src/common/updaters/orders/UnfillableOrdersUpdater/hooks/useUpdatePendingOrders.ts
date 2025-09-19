import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { AccountAddress, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { Order } from 'legacy/state/orders/actions'
import { getRemainderAmount } from 'legacy/state/orders/utils'

import { updatePendingOrderPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'
import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from 'modules/ordersTable/const/tabs'

import { useUpdateIsUnfillableFlag } from './useUpdateIsUnfillableFlag'

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

// Only update orders that are visible in the current page
const getUpdatableOrders = (orders: Order[], pageNumber?: number): Order[] => {
  const page = pageNumber && pageNumber > 0 ? pageNumber : 1
  const start = (page - 1) * ORDERS_TABLE_PAGE_SIZE
  const end = start + ORDERS_TABLE_PAGE_SIZE
  return orders.slice(start, end)
}

export function useUpdatePendingOrders(
  isWindowVisible: boolean,
  pageNumber?: number,
  tabId?: OrderTabId,
): (orders: Order[]) => void {
  const { chainId, account } = useWalletInfo()
  const updatePendingOrderPrices = useSetAtom(updatePendingOrderPricesAtom)
  const updateIsUnfillableFlag = useUpdateIsUnfillableFlag()

  const isValidTab = tabId === OrderTabId.open || tabId === OrderTabId.all

  const shouldUpdate = useCallback(
    (orders: Order[]): boolean => {
      return Boolean(isWindowVisible && account && chainId && orders.length && pageNumber && isValidTab)
    },
    [isWindowVisible, account, chainId, pageNumber, isValidTab],
  )

  return useCallback(
    (orders: Order[]) => {
      if (!shouldUpdate(orders)) return

      const updatableOrders = getUpdatableOrders(orders, pageNumber)

      updatableOrders.forEach((order) => {
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
    },
    [chainId, updateIsUnfillableFlag, updatePendingOrderPrices, pageNumber, shouldUpdate],
  )
}
