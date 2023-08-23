import { useEffect, useMemo, useRef, useState } from 'react'

import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'

import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { Nullish } from 'types'

import { USDC } from 'legacy/constants/tokens'

import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useWalletInfo } from 'modules/wallet'

import { useGetCoingeckoUsdPrice } from 'api/coingecko'
import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { TradeAmounts } from 'common/types'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { isFractionFalsy } from 'utils/isFractionFalsy'

interface GetPriceQuoteParams {
  currencyAmount: Nullish<CurrencyAmount<Currency>>
  error: Error | null
  price: Price<Token, Currency> | null
  isLoading: boolean
}

interface UsdAmountInfo {
  value: CurrencyAmount<Token> | null
  isLoading: boolean
}

export interface TradeUSDAmounts {
  inputAmount: UsdAmountInfo
  outputAmount: UsdAmountInfo
}

// common logic for returning price quotes
function useGetPriceQuote({ price, error, currencyAmount, isLoading }: GetPriceQuoteParams): UsdAmountInfo {
  return useMemo(() => {
    if (!price || error || !currencyAmount) return { value: null, isLoading }

    try {
      return { value: price.invert().quote(currencyAmount), isLoading }
    } catch (error: any) {
      return { value: null, isLoading }
    }
  }, [currencyAmount, error, isLoading, price])
}

function useCoingeckoUsdPrice(currency?: Currency) {
  // default to MAINNET (if disconnected e.g)
  const { chainId } = useWalletInfo()
  const blockNumber = useBlockNumber()
  const [price, setPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Currency is deep nested and we only really care about token address changing
  // so we ref it here as to avoid updating useEffect
  const currencyRef = useRef(currency)
  currencyRef.current = currency

  const isNative = !!currency?.isNative

  // get SWR cached coingecko usd price
  const {
    data: priceResponse,
    error: errorResponse,
    isLoading,
  } = useGetCoingeckoUsdPrice({
    chainId,
    currency,
    isNative,
  })

  useEffect(() => {
    // build baseAmount here as to not mess with deps array
    const baseAmount = tryParseCurrencyAmount('1', currencyRef.current)

    if (!priceResponse || !baseAmount) return

    try {
      if (errorResponse) throw errorResponse

      setError(null)

      if (!priceResponse?.amount) return

      const { amount: apiUsdPrice } = priceResponse
      // api returns converted units e.g $2.25 instead of 2255231233312312 (atoms)
      // we need to parse all USD returned amounts
      // and convert to the same currencyRef.current for both sides (SDK math invariant)
      // in our case we stick to the USDC paradigm
      const quoteAmount = tryParseCurrencyAmount(apiUsdPrice.toString(), USDC[chainId])
      // parse failure is unlikely - type safe
      if (!quoteAmount) return
      // create a new Price object
      // we need to invert here as it is
      // constructed based on the coingecko USD price response
      // e.g 1 unit of USER'S TOKEN represented in USD
      const usdPrice = new Price({
        baseAmount,
        quoteAmount,
      }).invert()

      console.debug(
        '[useCoingeckoUsdPrice] Best Coingecko USD price amount',
        usdPrice.toSignificant(12),
        usdPrice.invert().toSignificant(12)
      )

      return setPrice(usdPrice)
    } catch (error: any) {
      console.error(
        '[useStablecoinPrice::useCoingeckoUsdPrice]::Error getting USD price from Coingecko for token',
        currencyRef.current?.symbol,
        error
      )
      return batchedUpdate(() => {
        setError(new Error(error))
        setPrice(null)
      })
    }
    // don't depend on Currency (deep nested object)
  }, [chainId, blockNumber, priceResponse, errorResponse, isNative])

  return { price, error, isLoading }
}

export function useCoingeckoUsdValue(currencyAmount: Nullish<CurrencyAmount<Currency>>): UsdAmountInfo {
  const coingeckoUsdPrice = useCoingeckoUsdPrice(currencyAmount?.currency)

  return useGetPriceQuote({ ...coingeckoUsdPrice, currencyAmount })
}

function useHigherUSDValue(currencyAmount: Nullish<CurrencyAmount<Currency>>): UsdAmountInfo {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const checkedCurrencyAmount = isWrapOrUnwrap ? undefined : currencyAmount

  const { value, isLoading } = useCoingeckoUsdValue(checkedCurrencyAmount)

  return useSafeMemo(() => ({ value, isLoading }), [value, isLoading])
}

export function useTradeUSDValues({ inputAmount, outputAmount }: Partial<TradeAmounts>): TradeUSDAmounts {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isTradeReady = !isWrapOrUnwrap && !isFractionFalsy(inputAmount) && !isFractionFalsy(outputAmount)

  return {
    inputAmount: useHigherUSDValue(isTradeReady ? inputAmount : null),
    outputAmount: useHigherUSDValue(isTradeReady ? outputAmount : null),
  }
}
