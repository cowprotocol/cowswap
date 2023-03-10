import { useCallback, useEffect, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { CurrencyAmount, Price, Token } from '@uniswap/sdk-core'

import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { supportedChainId } from 'utils/supportedChainId'
import { usePendingOrders } from 'state/orders/hooks'
import { OrderClass } from 'state/orders/actions'
import { buildSpotPricesKey, updateSpotPricesAtom } from '@cow/modules/orders/state/spotPricesAtom'
import { useUpdateAtom } from 'state/application/atoms'
import { SPOT_PRICE_CHECK_POLL_INTERVAL } from 'state/orders/consts'
import { requestPrice } from '@cow/modules/limitOrders/hooks/useGetInitialPrice'
import { useSafeMemo } from '@cow/common/hooks/useSafeMemo'

/**
 * Spot Prices Updater
 *
 * Goes over all pending LIMIT orders and aggregates all markets
 * Queries the spot price for given markets at every SPOT_PRICE_CHECK_POLL_INTERVAL
 */
export function SpotPricesUpdater(): null {
  const { chainId: _chainId } = useWeb3React()
  const chainId = supportedChainId(_chainId)

  const isWindowVisible = useIsWindowVisible()
  const updateSpotPrices = useUpdateAtom(updateSpotPricesAtom)

  const pending = usePendingOrders({ chainId })

  const markets = useSafeMemo(() => {
    return pending.reduce<Record<string, { chainId: number; inputCurrency: Token; outputCurrency: Token }>>(
      (acc, order) => {
        if (chainId && order.class === OrderClass.LIMIT) {
          // Aggregating pending orders per market. No need to query multiple times same market
          const key = buildSpotPricesKey({
            chainId,
            sellTokenAddress: order.sellToken,
            buyTokenAddress: order.buyToken,
          })
          acc[key] = { chainId, inputCurrency: order.inputToken, outputCurrency: order.outputToken }
        }
        return acc
      },
      {}
    )
  }, [pending])

  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises

  const updatePending = useCallback(async () => {
    if (isUpdating.current) {
      console.debug('[SpotPricesUpdater] Update in progress, skipping')
      return
    }
    console.debug('[SpotPricesUpdater] Starting update')

    // Lock updates
    isUpdating.current = true

    const promises = Object.keys(markets).map((key) => {
      const { chainId, inputCurrency, outputCurrency } = markets[key]

      return requestPrice(chainId, inputCurrency, outputCurrency)
        .then((fraction) => {
          if (!fraction) {
            return
          }

          const price = new Price({
            quoteAmount: CurrencyAmount.fromRawAmount(outputCurrency, fraction.numerator),
            baseAmount: CurrencyAmount.fromRawAmount(inputCurrency, fraction.denominator),
          })

          console.debug(`[SpotPricesUpdater] Got new price for ${key}`, price.toFixed(6))

          updateSpotPrices({
            chainId,
            sellTokenAddress: inputCurrency.address,
            buyTokenAddress: outputCurrency.address,
            price,
          })
        })
        .catch((e) => {
          console.debug(`[SpotPricesUpdater] Failed to get price for ${key}`, e)
        })
    })

    // Wait everything to finish, regardless if failed or not
    await Promise.allSettled(promises)

    // Release update lock
    isUpdating.current = false

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(markets).sort().join(','), updateSpotPrices])

  useEffect(() => {
    if (!chainId || !isWindowVisible) {
      console.debug('[SpotPricesUpdater] No need to update spot prices')
      return
    }

    console.debug('[SpotPricesUpdater] Periodically check spot prices')

    updatePending()
    const interval = setInterval(updatePending, SPOT_PRICE_CHECK_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [chainId, isWindowVisible, updatePending])

  return null
}
