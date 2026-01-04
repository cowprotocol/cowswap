/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useAtom, useSetAtom } from 'jotai'
import { useRef } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { isSellOrder } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR, { SWRConfiguration } from 'swr'

import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'legacy/state/orders/consts'

import { updatePendingOrderPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'

import { GenericOrder } from 'common/types'

import { useIsProviderNetworkUnsupported } from '../../../../hooks/useIsProviderNetworkUnsupported'
import { useUpdateIsUnfillableFlag } from '../hooks/useUpdateIsUnfillableFlag'
import { fetchOrderPrice } from '../services/fetchOrderPrice'
import { orderLastTimePriceUpdateAtom } from '../state/orderLastTimePriceUpdateAtom'

const SWR_CONFIG: SWRConfiguration = {
  // Since we use orderLastTimePriceUpdateAtom to avoid frequent quote updates
  // We can try to refresh twice frequent, because it won't do a fetch anyway
  // But for example, if you updated a quote at 13:00:10, closed the tab, and opened it at 13:00:20
  // it will skip the initial quote update, because it hasn't been 30 seconds since the last update (13:00:20 - 13:00:10 = 10)
  // But since we have refreshInterval = 30/2, it will try to refresh again at 13:00:35 and at 13:00:50
  // At 13:00:50 it will be 30 seconds since the last update (13:00:50 - 13:00:10 = 40)
  // having this, we won't have too big time gap between quote updates
  refreshInterval: PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL / 2,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  isPaused() {
    return !document.hasFocus()
  },
}

interface UnfillableOrderUpdaterProps {
  chainId: SupportedChainId
  order: GenericOrder
}

export function UnfillableOrderUpdater({ chainId, order }: UnfillableOrderUpdaterProps): null {
  const [orderLastTimePriceUpdate, setOrderLastTimePriceUpdate] = useAtom(orderLastTimePriceUpdateAtom)
  const updatePendingOrderPrices = useSetAtom(updatePendingOrderPricesAtom)
  const updateIsUnfillableFlag = useUpdateIsUnfillableFlag()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isWindowVisible = useIsWindowVisible()

  const lastTimePriceUpdate = orderLastTimePriceUpdate[order.id]
  const lastTimePriceUpdateRef = useRef(lastTimePriceUpdate)
  // eslint-disable-next-line react-hooks/refs
  lastTimePriceUpdateRef.current = lastTimePriceUpdate

  useSWR(
    !isProviderNetworkUnsupported && isWindowVisible
      ? [order, setOrderLastTimePriceUpdate, chainId, order.id, 'UnfillableOrderUpdater']
      : null,
    ([order, setOrderLastTimePriceUpdate, chainId]) => {
      const now = Date.now()
      const shouldSkipUpdate =
        !!lastTimePriceUpdateRef.current &&
        now - lastTimePriceUpdateRef.current < PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL

      if (shouldSkipUpdate) return

      console.debug(`[UnfillableOrderUpdater] update order ${order.id}`, {
        chainId,
        order,
        now,
      })
      setOrderLastTimePriceUpdate((state) => ({ ...state, [order.id]: now }))

      fetchOrderPrice(chainId, order)
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
    },
    SWR_CONFIG,
  )

  return null
}
