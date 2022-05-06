import { Currency, CurrencyAmount, Price, Token /*, TradeType*/ } from '@uniswap/sdk-core'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SupportedChainId } from 'constants/chains'
import { /*DAI_OPTIMISM,*/ USDC /*, USDC_ARBITRUM, USDC_MAINNET, USDC_POLYGON*/ } from 'constants/tokens'
// import { useBestV2Trade } from './useBestV2Trade'
// import { useClientSideV3Trade } from './useClientSideV3Trade'

// MOD imports
import { supportedChainId } from 'utils/supportedChainId'
import { STABLECOIN_AMOUNT_OUT as STABLECOIN_AMOUNT_OUT_UNI } from 'hooks/useUSDCPrice'
import { stringToCurrency } from 'state/swap/extension'
import { OrderKind } from 'state/orders/actions'
import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { getUSDPriceQuote, toPriceInformation } from 'api/coingecko'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { currencyId } from 'utils/currencyId'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import useGetGpPriceStrategy from 'hooks/useGetGpPriceStrategy'
import { MAX_VALID_TO_EPOCH } from 'hooks/useSwapCallback'
import { CancelableResult, onlyResolvesLast } from 'utils/async'
import { getGpUsdcPrice, PriceInformation } from 'utils/price'
import useSWR from 'swr'

export * from '@src/hooks/useUSDCPrice'

const getGpUsdcPriceResolveOnlyLastCall = onlyResolvesLast(getGpUsdcPrice)

const STABLECOIN_AMOUNT_OUT: { [chain in SupportedChainId]: CurrencyAmount<Token> } = {
  ...STABLECOIN_AMOUNT_OUT_UNI,
  // MOD: lowers threshold from 100k to 100
  // [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC_MAINNET, 100_000e6),
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.MAINNET], 100e6),
  [SupportedChainId.RINKEBY]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.RINKEBY], 100e6),
  // [SupportedChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(USDC_ARBITRUM, 10_000e6),
  // [SupportedChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(DAI_OPTIMISM, 10_000e18),
  // [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(USDC_POLYGON, 10_000e6),
  [SupportedChainId.XDAI]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.XDAI], 10_000e6),
}

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useCowUsdPrice(currency?: Currency) {
  const [bestUsdPrice, setBestUsdPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const { chainId, account } = useActiveWeb3React()
  // use quote loading as a price update dependency
  const strategy = useGetGpPriceStrategy()

  const sellTokenAddress = currency?.wrapped.address
  const sellTokenDecimals = currency?.wrapped.decimals

  /* // TODO(#2808): remove dependency on useBestV2Trade
  const v2USDCTrade = useBestV2Trade(TradeType.EXACT_OUTPUT, amountOut, currency, {
    maxHops: 2,
  })
  const v3USDCTrade = useClientSideV3Trade(TradeType.EXACT_OUTPUT, amountOut, currency)

  return useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined
    }

    // handle usdc
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, '1', '1')
    }

    // use v2 price if available, v3 as fallback
    if (v2USDCTrade) {
      const { numerator, denominator } = v2USDCTrade.route.midPrice
      return new Price(currency, stablecoin, denominator, numerator)
    } else if (v3USDCTrade.trade) {
      const { numerator, denominator } = v3USDCTrade.trade.routes[0].midPrice
      return new Price(currency, stablecoin, denominator, numerator)
    }

    return undefined
  }, [currency, stablecoin, v2USDCTrade, v3USDCTrade.trade]) */

  const supportedChain = supportedChainId(chainId)
  const baseAmount = supportedChain ? STABLECOIN_AMOUNT_OUT[supportedChain] : undefined
  const stablecoin = baseAmount?.currency
  const baseAmountRaw = baseAmount?.quotient.toString()

  const quoteParams = useMemo(() => {
    if (!stablecoin || !supportedChain || !sellTokenAddress || !sellTokenDecimals) return null

    return {
      buyToken: stablecoin.address,
      sellToken: sellTokenAddress,
      kind: OrderKind.BUY,
      amount: baseAmountRaw,
      chainId: supportedChain,
      fromDecimals: sellTokenDecimals,
      toDecimals: stablecoin.decimals,
      userAddress: account,
      // we dont care about validTo here, just use max
      validTo: MAX_VALID_TO_EPOCH,
    }
  }, [account, baseAmountRaw, sellTokenAddress, sellTokenDecimals, stablecoin, supportedChain])

  // SWR cache cow usd requests
  const { data: priceResponse, error: errorResponse } = useSWR<CancelableResult<string | null> | null>(
    ['cowUsdPrice', strategy, quoteParams],
    () => (strategy && quoteParams ? getGpUsdcPriceResolveOnlyLastCall({ strategy, quoteParams }) : null)
  )

  useEffect(() => {
    if (!quoteParams || !stablecoin || !priceResponse || !currency) return

    // tokens are the same, it's 1:1
    if (sellTokenAddress === stablecoin.address) {
      const price = new Price(stablecoin, stablecoin, '1', '1')
      return setBestUsdPrice(price)
    } else {
      try {
        if (errorResponse) throw errorResponse

        const { cancelled, data: quote } = priceResponse
        if (cancelled) return

        // reset the error
        setError(null)

        let price: Price<Token, Currency> | null
        // Response can include a null price amount
        // e.g fee > input error
        if (!quote) {
          price = null
        } else {
          price = new Price({
            baseAmount,
            quoteAmount: stringToCurrency(quote, currency),
          })
          console.debug(
            '[useBestUSDCPrice] Best USDC price amount',
            price.toSignificant(12),
            price.invert().toSignificant(12)
          )
        }

        return setBestUsdPrice(price)
      } catch (err) {
        console.error('[useBestUSDCPrice] Error getting best price', err)
        return batchedUpdate(() => {
          setError(new Error(err))
          setBestUsdPrice(null)
        })
      }
    }
  }, [baseAmount, priceResponse, errorResponse, quoteParams, sellTokenAddress, stablecoin, strategy, currency])

  return { price: bestUsdPrice, error }
}

interface GetPriceQuoteParams {
  currencyAmount?: CurrencyAmount<Currency>
  error: Error | null
  price: Price<Token, Currency> | null
}

// common logic for returning price quotes
function useGetPriceQuote({ price, error, currencyAmount }: GetPriceQuoteParams) {
  return useMemo(() => {
    // if (!price || !currencyAmount) return null
    if (!price || error || !currencyAmount) return null

    try {
      // return price.quote(currencyAmount)
      return price.invert().quote(currencyAmount)
    } catch (error) {
      return null
    }
    // }, [currencyAmount, price])
  }, [currencyAmount, error, price])
}

/**
 * Returns the price in USDC of the input currency from price APIs
 * @param currencyAmount currency to compute the USDC price of
 */
export function useUSDCValue(currencyAmount?: CurrencyAmount<Currency>) {
  const usdcPrice = useCowUsdPrice(currencyAmount?.currency)

  return useGetPriceQuote({ ...usdcPrice, currencyAmount })
}

export function useCoingeckoUsdPrice(currency?: Currency) {
  // default to MAINNET (if disconnected e.g)
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const [price, setPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Currency is deep nested and we only really care about token address changing
  // so we ref it here as to avoid updating useEffect
  const currencyRef = useRef(currency)
  currencyRef.current = currency

  const tokenAddress = currencyRef.current ? currencyId(currencyRef.current) : undefined

  const chainIdSupported = supportedChainId(chainId)
  // SWR cache cg usd requests
  const { data: priceResponse, error: errorResponse } = useSWR<PriceInformation | null>(
    ['coingeckoUsdPrice', chainIdSupported, tokenAddress],
    () =>
      chainIdSupported && tokenAddress
        ? getUSDPriceQuote({
            chainId: chainIdSupported,
            tokenAddress,
          }).then(toPriceInformation)
        : null
  )

  useEffect(() => {
    // build baseAmount here as to not mess with deps array
    const baseAmount = tryParseCurrencyAmount('1', currencyRef.current)

    if (!chainIdSupported || !priceResponse || !baseAmount) return

    try {
      if (errorResponse) throw errorResponse

      setError(null)

      if (!priceResponse?.amount) return

      const { amount: apiUsdPrice } = priceResponse
      // api returns converted units e.g $2.25 instead of 2255231233312312 (atoms)
      // we need to parse all USD returned amounts
      // and convert to the same currencyRef.current for both sides (SDK math invariant)
      // in our case we stick to the USDC paradigm
      const quoteAmount = tryParseCurrencyAmount(apiUsdPrice.toString(), USDC[chainIdSupported])
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
    } catch (error) {
      console.error(
        '[useUSDCPrice::useCoingeckoUsdPrice]::Error getting USD price from Coingecko for token',
        tokenAddress,
        error
      )
      return batchedUpdate(() => {
        setError(new Error(error))
        setPrice(null)
      })
    }
    // don't depend on Currency (deep nested object)
  }, [chainId, blockNumber, tokenAddress, chainIdSupported, priceResponse, errorResponse])

  return { price, error }
}

export function useCoingeckoUsdValue(currencyAmount: CurrencyAmount<Currency> | undefined) {
  const coingeckoUsdPrice = useCoingeckoUsdPrice(currencyAmount?.currency)

  return useGetPriceQuote({ ...coingeckoUsdPrice, currencyAmount })
}

export function useHigherUSDValue(currencyAmount: CurrencyAmount<Currency> | undefined) {
  const gpUsdPrice = useUSDCValue(currencyAmount)
  const coingeckoUsdPrice = useCoingeckoUsdValue(currencyAmount)

  return coingeckoUsdPrice || gpUsdPrice
}

/**
 *
 * @param fiatValue string representation of a USD amount
 * @returns CurrencyAmount where currency is stablecoin on active chain
 */
// TODO: new function, check whether it's usueful anywhere
/* export function useStablecoinAmountFromFiatValue(fiatValue: string | null | undefined) {
  const { chainId } = useActiveWeb3React()
  const stablecoin = chainId ? STABLECOIN_AMOUNT_OUT[chainId]?.currency : undefined

  if (fiatValue === null || fiatValue === undefined || !chainId || !stablecoin) {
    return undefined
  }

  // trim for decimal precision when parsing
  const parsedForDecimals = parseFloat(fiatValue).toFixed(stablecoin.decimals).toString()

  try {
    // parse USD string into CurrencyAmount based on stablecoin decimals
    return tryParseCurrencyAmount(parsedForDecimals, stablecoin)
  } catch (error) {
    return undefined
  }
} */
