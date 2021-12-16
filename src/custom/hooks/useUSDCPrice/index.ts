import { CurrencyAmount, Currency, Price, Token } from '@uniswap/sdk-core'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SupportedChainId } from 'constants/chains'
/* import { DAI_OPTIMISM, USDC, USDC_ARBITRUM } from '../constants/tokens'
import { useV2TradeExactOut } from './useV2Trade'
import { useBestV3TradeExactOut } from './useBestV3Trade' */
import { useActiveWeb3React } from 'hooks/web3'

import { supportedChainId } from 'utils/supportedChainId'
import { getBestPrice } from 'utils/price'
import { STABLECOIN_AMOUNT_OUT as STABLECOIN_AMOUNT_OUT_UNI } from 'hooks/useUSDCPrice'
import { stringToCurrency } from 'state/swap/extension'
import { USDC_XDAI } from 'utils/xdai/constants'
import { OrderKind } from 'state/orders/actions'
import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { getUSDPriceQuote, toPriceInformation } from 'api/coingecko'
import { tryParseAmount } from 'state/swap/hooks'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { currencyId } from 'utils/currencyId'
import { USDC } from 'constants/tokens'
import { useBlockNumber } from '@src/state/application/hooks'

export * from '@src/hooks/useUSDCPrice'

const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  ...STABLECOIN_AMOUNT_OUT_UNI,
  // MOD: lowers threshold from 100k to 100
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC, 100e6),
  [SupportedChainId.XDAI]: CurrencyAmount.fromRawAmount(USDC_XDAI, 10_000e6),
}

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency) {
  const [bestUsdPrice, setBestUsdPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const { chainId, account } = useActiveWeb3React()
  const blockNumber = useBlockNumber()

  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined
  const stablecoin = amountOut?.currency

  /* 
  const v2USDCTrade = useV2TradeExactOut(currency, amountOut, {
    maxHops: 2,
  })
  const v3USDCTrade = useBestV3TradeExactOut(currency, amountOut)

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
      const { numerator, denominator } = v3USDCTrade.trade.route.midPrice
      return new Price(currency, stablecoin, denominator, numerator)
    }

    return undefined
  }, [currency, stablecoin, v2USDCTrade, v3USDCTrade.trade]) 
  */

  useEffect(() => {
    const isSupportedChain = supportedChainId(chainId)
    if (!isSupportedChain || !currency || !amountOut || !stablecoin) return

    const params = {
      baseToken: stablecoin.address,
      quoteToken: currency.wrapped.address,
      kind: OrderKind.BUY,
      amount: amountOut.quotient.toString(),
      chainId: isSupportedChain,
      fromDecimals: currency.decimals,
      toDecimals: stablecoin.decimals,
      userAddress: account,
    }

    if (currency.wrapped.equals(stablecoin)) {
      const price = new Price(stablecoin, stablecoin, '1', '1')
      return setBestUsdPrice(price)
    } else {
      getBestPrice(params)
        .then((winningPrice) => {
          // reset the error
          setError(null)

          let price: Price<Token, Currency> | null
          // Response can include a null price amount
          // e.g fee > input error
          if (!winningPrice.amount) {
            price = null
          } else {
            price = new Price({
              baseAmount: amountOut,
              quoteAmount: stringToCurrency(winningPrice.amount, currency),
            })
            console.debug(
              '[useBestUSDCPrice] Best USDC price amount',
              price.toSignificant(12),
              price.invert().toSignificant(12)
            )
          }

          return setBestUsdPrice(price)
        })
        .catch((err) => {
          console.error('[useBestUSDCPrice] Error getting best price', err)
          return batchedUpdate(() => {
            setError(new Error(err))
            setBestUsdPrice(null)
          })
        })
    }
  }, [amountOut, chainId, currency, stablecoin, account, blockNumber])

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
  const usdcPrice = useUSDCPrice(currencyAmount?.currency)

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

  useEffect(() => {
    const isSupportedChainId = supportedChainId(chainId)
    const baseAmount = tryParseAmount('1', currencyRef.current)

    if (!isSupportedChainId || !tokenAddress || !baseAmount) return

    getUSDPriceQuote({
      chainId: isSupportedChainId,
      tokenAddress,
    })
      .then(toPriceInformation)
      .then((priceResponse) => {
        setError(null)

        if (!priceResponse?.amount) return

        const { amount: apiUsdPrice } = priceResponse
        // api returns converted units e.g $2.25 instead of 2255231233312312 (atoms)
        // we need to parse all USD returned amounts
        // and convert to the same currencyRef.current for both sides (SDK math invariant)
        // in our case we stick to the USDC paradigm
        const quoteAmount = tryParseAmount(apiUsdPrice.toString(), USDC)
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
      })
      .catch((error) => {
        console.error(
          '[useUSDCPrice::useCoingeckoUsdPrice]::Error getting USD price from Coingecko for token',
          tokenAddress,
          error
        )
        return batchedUpdate(() => {
          setError(new Error(error))
          setPrice(null)
        })
      })
    // don't depend on Currency (deep nested object)
  }, [chainId, blockNumber, tokenAddress])

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
