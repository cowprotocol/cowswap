import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { AccountAddress, QuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { Order } from 'legacy/state/orders/actions'
import { getRemainderAmount } from 'legacy/state/orders/utils'

import { updatePendingOrderPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'

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

export function useUpdatePendingOrders(): (orders: Order[]) => void {
  const { chainId, account } = useWalletInfo()
  const updatePendingOrderPrices = useSetAtom(updatePendingOrderPricesAtom)
  const updateIsUnfillableFlag = useUpdateIsUnfillableFlag()

  return useCallback(
    (orders: Order[]) => {
      if (!account || !orders.length) return

      orders.forEach((order) => {
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
    [account, chainId, updateIsUnfillableFlag, updatePendingOrderPrices],
  )
}
