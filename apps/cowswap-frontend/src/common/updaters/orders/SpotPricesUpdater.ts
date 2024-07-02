import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { FractionUtils } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Token } from '@uniswap/sdk-core'

import { SPOT_PRICE_CHECK_POLL_INTERVAL } from 'legacy/state/orders/consts'
import { useCombinedPendingOrders } from 'legacy/state/orders/hooks'

import { requestPrice } from 'modules/limitOrders/hooks/useGetInitialPrice'
import { UpdateSpotPriceAtom, updateSpotPricesAtom } from 'modules/orders/state/spotPricesAtom'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { useSafeMemo } from '../../hooks/useSafeMemo'
import { getCanonicalMarketChainKey } from '../../utils/markets'

type MarketRecord = Record<
  string,
  {
    chainId: number
    inputCurrency: Token
    outputCurrency: Token
  }
>

function useMarkets(chainId: SupportedChainId, account: string | undefined): MarketRecord {
  const pending = useCombinedPendingOrders({ chainId, account })

  return useSafeMemo(() => {
    return pending.reduce<Record<string, { chainId: number; inputCurrency: Token; outputCurrency: Token }>>(
      (acc, order) => {
        // Do not query spot prices for SWAP
        if (getUiOrderType(order) === UiOrderType.SWAP) return acc

        // Aggregating pending orders per market. No need to query multiple times same market
        const { marketInverted, marketKey } = getCanonicalMarketChainKey(chainId, order.sellToken, order.buyToken)

        const [inputCurrency, outputCurrency] = marketInverted
          ? [order.outputToken, order.inputToken]
          : [order.inputToken, order.outputToken]

        acc[marketKey] = {
          chainId,
          inputCurrency,
          outputCurrency,
        }

        return acc
      },
      {}
    )
  }, [pending])
}

interface UseUpdatePendingProps {
  isWindowVisibleRef: React.MutableRefObject<boolean>
  isUpdating: React.MutableRefObject<boolean>
  markets: MarketRecord
  updateSpotPrices: (update: UpdateSpotPriceAtom) => void
}

function useUpdatePending(props: UseUpdatePendingProps) {
  const { isWindowVisibleRef, isUpdating, markets, updateSpotPrices } = props

  return useCallback(async () => {
    if (isUpdating.current) {
      return
    }

    if (!isWindowVisibleRef.current) {
      return
    }

    // Lock updates
    isUpdating.current = true

    const promises = Object.keys(markets).map((key) => {
      const { chainId, inputCurrency, outputCurrency } = markets[key]

      return requestPrice(chainId, inputCurrency, outputCurrency)
        .then((fraction) => {
          if (!fraction) {
            return
          }

          const price = FractionUtils.toPrice(fraction, inputCurrency, outputCurrency)

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
}

/**
 * TODO: move this updater to modules/orders
 * Spot Prices Updater
 *
 * Goes over all pending LIMIT orders and aggregates all markets
 * Queries the spot price for given markets at every SPOT_PRICE_CHECK_POLL_INTERVAL
 */
export function SpotPricesUpdater(): null {
  const { chainId, account } = useWalletInfo()

  const isWindowVisible = useIsWindowVisible()
  const isWindowVisibleRef = useRef(isWindowVisible)

  const updateSpotPrices = useSetAtom(updateSpotPricesAtom)
  const markets = useMarkets(chainId, account)
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises
  const updatePending = useUpdatePending({ isWindowVisibleRef, isUpdating, markets, updateSpotPrices })

  isWindowVisibleRef.current = isWindowVisible

  useEffect(() => {
    updatePending()

    const interval = setInterval(updatePending, SPOT_PRICE_CHECK_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [chainId, isWindowVisible, updatePending])

  return null
}
