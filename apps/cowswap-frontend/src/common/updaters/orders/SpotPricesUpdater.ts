import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Price, Token } from '@uniswap/sdk-core'

import { useCombinedPendingOrders } from 'legacy/state/orders/hooks'

import { updateSpotPricesAtom } from 'modules/orders/state/spotPricesAtom'
import { getUsdPriceStateKey, UsdPriceState } from 'modules/usdAmount'
import { useUsdPrices } from 'modules/usdAmount/hooks/useUsdPrice'

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
      {},
    )
  }, [pending])
}

/**
 * Spot Prices Updater
 *
 * Goes over all pending LIMIT orders and aggregates all markets
 * Fetches the spot prices for all markets based on USD prices from usdPricesAtom
 */
export function SpotPricesUpdater(): null {
  const { chainId, account } = useWalletInfo()

  const updateSpotPrices = useSetAtom(updateSpotPricesAtom)
  const markets = useMarkets(chainId, account)

  const marketTokens = useMemo(() => {
    return Object.values(markets).reduce<Token[]>((acc, { inputCurrency, outputCurrency }) => {
      acc.push(inputCurrency)
      acc.push(outputCurrency)

      return acc
    }, [])
  }, [markets])

  const usdPrices = useUsdPrices(marketTokens)

  useEffect(() => {
    Object.values(markets).forEach(({ inputCurrency, outputCurrency }) => {
      const inputPrice = usdPrices[getUsdPriceStateKey(inputCurrency)]
      const outputPrice = usdPrices[getUsdPriceStateKey(outputCurrency)]

      if (!isUsdPriceStateReady(inputPrice) || !isUsdPriceStateReady(outputPrice)) {
        return
      }

      try {
        const inputFraction = FractionUtils.fromPrice(inputPrice.price)
        const outputFraction = FractionUtils.fromPrice(outputPrice.price)
        const fraction = inputFraction.divide(outputFraction)

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
      } catch (e) {
        console.error(
          `[SpotPricesUpdater] Failed to calculate spot price for ${inputCurrency.address} and ${outputCurrency.address}`,
          inputPrice.price.numerator.toString(),
          inputPrice.price.denominator.toString(),
          outputPrice.price.numerator.toString(),
          outputPrice.price.denominator.toString(),
          e,
        )
      }
    })
  }, [usdPrices, markets, chainId, updateSpotPrices])

  return null
}

function isUsdPriceStateReady(
  state: UsdPriceState | null,
): state is UsdPriceState & { price: Price<Token, Token>; isLoading: false } {
  return !!state && !!state.price && !state.isLoading
}
