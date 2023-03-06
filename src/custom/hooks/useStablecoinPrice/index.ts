import { Currency, CurrencyAmount, Price, Token /*, TradeType*/ } from '@uniswap/sdk-core'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SupportedChainId } from 'constants/chains'
import { /*DAI_OPTIMISM,*/ USDC /*, USDC_ARBITRUM, USDC_MAINNET, USDC_POLYGON*/ } from 'constants/tokens'
// import { useBestV2Trade } from './useBestV2Trade'
// import { useClientSideV3Trade } from './useClientSideV3Trade'

// MOD imports
import { supportedChainId } from 'utils/supportedChainId'
import { STABLECOIN_AMOUNT_OUT as STABLECOIN_AMOUNT_OUT_UNI } from 'hooks/useStablecoinPrice'
import { stringToCurrency } from 'state/swap/extension'
import { OrderKind } from 'state/orders/actions'
import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { useGetCoingeckoUsdPrice } from '@cow/api/coingecko'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
// import { currencyId } from 'utils/currencyId'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import useGetGpPriceStrategy from 'hooks/useGetGpPriceStrategy'
import { useGetGpUsdcPrice } from 'utils/price'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { useWalletInfo } from '@cow/modules/wallet'

export * from '@src/hooks/useStablecoinPrice'

export const getUsdQuoteValidTo = () => Math.ceil(Date.now() / 1000) + 600
const STABLECOIN_AMOUNT_OUT: { [chain in SupportedChainId]: CurrencyAmount<Token> } = {
  ...STABLECOIN_AMOUNT_OUT_UNI,
  // MOD: lowers threshold from 100k to 100
  // [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC_MAINNET, 100_000e6),
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.MAINNET], 100e6),
  // [SupportedChainId.RINKEBY]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.RINKEBY], 100e6),
  // [SupportedChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(USDC_ARBITRUM, 10_000e6),
  // [SupportedChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(DAI_OPTIMISM, 10_000e18),
  // [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(USDC_POLYGON, 10_000e6),
  [SupportedChainId.GOERLI]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.GOERLI], 100e6),
  [SupportedChainId.GNOSIS_CHAIN]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.GNOSIS_CHAIN], 10_000e6),
}

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useCowUsdPrice(currency?: Currency) {
  const [bestUsdPrice, setBestUsdPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const chainId = currency?.chainId
  const { account } = useWalletInfo()
  // use quote loading as a price update dependency
  const strategy = useGetGpPriceStrategy()

  const sellTokenAddress = currency?.wrapped.address
  const sellTokenDecimals = currency?.wrapped.decimals

  /*
  // TODO(#2808): remove dependency on useBestV2Trade
  const v2USDCTrade = useBestV2Trade(TradeType.EXACT_OUTPUT, amountOut, currency, {
    maxHops: 2,
  })
  const v3USDCTrade = useClientSideV3Trade(TradeType.EXACT_OUTPUT, amountOut, currency)
  const price = useMemo(() => {
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
  }, [currency, stablecoin, v2USDCTrade, v3USDCTrade.trade])
  */

  const supportedChain = supportedChainId(chainId)
  const baseAmount = supportedChain ? STABLECOIN_AMOUNT_OUT[supportedChain] : undefined
  const stablecoin = baseAmount?.currency
  const baseAmountRaw = baseAmount?.quotient.toString()

  const isStablecoin = sellTokenAddress && sellTokenAddress === stablecoin?.address
  // build quote params
  // null when no chain or base amount or if sell token = stablecoin
  const quoteParams = useMemo(() => {
    if (!stablecoin || isStablecoin || !supportedChain || !sellTokenAddress || !sellTokenDecimals || !baseAmountRaw)
      return null

    return {
      buyToken: stablecoin.address,
      sellToken: sellTokenAddress,
      kind: OrderKind.BUY,
      amount: baseAmountRaw,
      chainId: supportedChain,
      fromDecimals: sellTokenDecimals,
      toDecimals: stablecoin.decimals,
      userAddress: account,
      validTo: getUsdQuoteValidTo(),
      isEthFlow: false,
    }
  }, [account, baseAmountRaw, isStablecoin, sellTokenAddress, sellTokenDecimals, stablecoin, supportedChain])

  // get SWR cached usd price
  const { data: quote, error: errorResponse } = useGetGpUsdcPrice({
    strategy,
    quoteParams,
  })

  useEffect(() => {
    if (!quoteParams || !stablecoin || !currency) return

    // tokens are the same, it's 1:1
    if (isStablecoin) {
      const price = new Price(stablecoin, stablecoin, '1', '1')
      return setBestUsdPrice(price)
    } else if (quote) {
      try {
        if (errorResponse) throw errorResponse

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
            '[useCowUsdPrice] COW USDC price amount',
            price.toSignificant(12),
            price.invert().toSignificant(12)
          )
        }

        return setBestUsdPrice(price)
      } catch (err: any) {
        console.error('[useCowUsdPrice] Error getting best price', err)
        return batchedUpdate(() => {
          setError(new Error(err))
          setBestUsdPrice(null)
        })
      }
    }
  }, [baseAmount, errorResponse, quoteParams, sellTokenAddress, stablecoin, strategy, currency, isStablecoin, quote])

  /* const lastPrice = useRef(bestUsdPrice)
  if (!bestUsdPrice || !lastPrice.current || !bestUsdPrice.equalTo(lastPrice.current)) {
    lastPrice.current = bestUsdPrice
  } */

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
    } catch (error: any) {
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
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useWalletInfo()
  const blockNumber = useBlockNumber()
  const [price, setPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Currency is deep nested and we only really care about token address changing
  // so we ref it here as to avoid updating useEffect
  const currencyRef = useRef(currency)
  currencyRef.current = currency

  const isNative = !!currency?.isNative
  // use wrapped address equivalent if native (DONT USE "ETH" or "XDAI")
  const tokenAddress = currency?.wrapped.address

  const chainIdSupported = supportedChainId(chainId)
  // get SWR cached coingecko usd price
  const { data: priceResponse, error: errorResponse } = useGetCoingeckoUsdPrice({
    chainId: chainIdSupported,
    tokenAddress,
    isNative,
  })

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
    } catch (error: any) {
      console.error(
        '[useStablecoinPrice::useCoingeckoUsdPrice]::Error getting USD price from Coingecko for token',
        tokenAddress,
        error
      )
      return batchedUpdate(() => {
        setError(new Error(error))
        setPrice(null)
      })
    }
    // don't depend on Currency (deep nested object)
  }, [chainId, blockNumber, tokenAddress, chainIdSupported, priceResponse, errorResponse, isNative])

  /* const lastPrice = useRef(price)
  if (!price || !lastPrice.current || !price.equalTo(lastPrice.current)) {
    lastPrice.current = price
  } */

  return { price, error }
}

export function useCoingeckoUsdValue(currencyAmount: CurrencyAmount<Currency> | undefined) {
  const coingeckoUsdPrice = useCoingeckoUsdPrice(currencyAmount?.currency)

  return useGetPriceQuote({ ...coingeckoUsdPrice, currencyAmount })
}

export function useHigherUSDValue(currencyAmount: CurrencyAmount<Currency> | undefined) {
  const { isWrapOrUnwrap } = useDetectNativeToken()
  const checkedCurrencyAmount = isWrapOrUnwrap ? undefined : currencyAmount
  // if iswrap or unwrap use undefined values to not run expensive calculation
  const gpUsdPrice = useUSDCValue(checkedCurrencyAmount)
  const coingeckoUsdPrice = useCoingeckoUsdValue(checkedCurrencyAmount)

  /* TODO: review this capturing - it's super noisy in sentry
  if (!!currencyAmount) {
    // report this to sentry
    capturePriceFeedException(
      _buildExceptionIssueParams(currencyAmount),
      // price feed results
      { res: !!gpUsdPrice, name: 'COW_API' },
      { res: !!coingeckoUsdPrice, name: 'COINGECKO' }
    )
  } */

  return coingeckoUsdPrice || gpUsdPrice
}

/* function _buildExceptionIssueParams(currencyAmount: CurrencyAmount<Currency> | undefined) {
  const token = currencyAmount?.wrapped.currency
  return {
    // issue name
    message: '[UsdPriceFeed] - EmptyResponse',
    // tags
    tags: { errorType: 'usdPriceFeed' },
    // context
    context: {
      quotedCurrency: token?.symbol || token?.address || SentryTag.UNKNOWN,
      amount: currencyAmount?.toExact() || SentryTag.UNKNOWN,
    },
  }
} */

/**
 *
 * @param fiatValue string representation of a USD amount
 * @returns CurrencyAmount where currency is stablecoin on active chain
 */
/*
export function useStablecoinAmountFromFiatValue(fiatValue: string | null | undefined) {
  const { chainId } = useWalletInfo()
  const stablecoin = chainId ? STABLECOIN_AMOUNT_OUT[chainId]?.currency : undefined

  return useMemo(() => {
    if (fiatValue === null || fiatValue === undefined || !chainId || !stablecoin) {
      return undefined
    }

    // trim for decimal precision when parsing
    const parsedForDecimals = parseFloat(fiatValue).toFixed(stablecoin.decimals).toString()
    try {
      // parse USD string into CurrencyAmount based on stablecoin decimals
      return tryParseCurrencyAmount(parsedForDecimals, stablecoin)
    } catch (error: any) {
      return undefined
    }
  }, [chainId, fiatValue, stablecoin])
}
*/
