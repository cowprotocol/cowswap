import { CurrencyAmount, Currency, Price, Token } from '@uniswap/sdk-core'
import { useEffect, useMemo, useState } from 'react'
import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { supportedChainId } from 'utils/supportedChainId'
import { useActiveWeb3React } from 'hooks/web3'
import { getBestPrice } from 'utils/price'
import { STABLECOIN_AMOUNT_OUT as STABLECOIN_AMOUNT_OUT_UNI } from 'hooks/useUSDCPrice'
import { stringToCurrency } from 'state/swap/extension'
import { SupportedChainId } from 'constants/chains'
import { USDC_XDAI } from 'utils/xdai/constants'
import { OrderKind } from 'state/orders/actions'
import { getUSDPriceQuote, toPriceInformation } from 'api/coingecko'
import { tryParseAmount } from 'state/swap/hooks'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { currencyId } from 'utils/currencyId'
import { USDC } from 'constants/tokens'

export * from '@src/hooks/useUSDCPrice'

const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  ...STABLECOIN_AMOUNT_OUT_UNI,
  [SupportedChainId.XDAI]: CurrencyAmount.fromRawAmount(USDC_XDAI, 10_000e6),
}

export default function useUSDCPrice(currency?: Currency) {
  const [bestUsdPrice, setBestUsdPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const { chainId, account } = useActiveWeb3React()

  // USDC constants
  // 100_000e6 USDC @ 6 decimals
  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined
  const stablecoin = amountOut?.currency

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
  }, [amountOut, chainId, currency, stablecoin, account])

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
    if (!price || error || !currencyAmount) return null

    try {
      return price.invert().quote(currencyAmount)
    } catch (error) {
      return null
    }
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
  const [price, setPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const isSupportedChainId = supportedChainId(chainId)
    if (!isSupportedChainId || !currency) return

    const baseAmount = tryParseAmount('1', currency)
    const tokenAddress = currencyId(currency)

    if (baseAmount) {
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
          // and convert to the same currency for both sides (SDK math invariant)
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
            currency.symbol,
            error
          )
          return batchedUpdate(() => {
            setError(new Error(error))
            setPrice(null)
          })
        })
    }
  }, [chainId, currency])

  return { price, error }
}

export function useCoingeckoUsdValue(currencyAmount: CurrencyAmount<Currency> | undefined) {
  const coingeckoUsdPrice = useCoingeckoUsdPrice(currencyAmount?.currency)

  return useGetPriceQuote({ ...coingeckoUsdPrice, currencyAmount })
}

export function useHigherUSDValue(currencyAmount: CurrencyAmount<Currency> | undefined) {
  const usdcValue = useUSDCValue(currencyAmount)
  const coingeckoUsdPrice = useCoingeckoUsdValue(currencyAmount)

  return useMemo(() => {
    // USDC PRICE UNAVAILABLE
    if (!usdcValue && coingeckoUsdPrice) {
      return coingeckoUsdPrice
      // COINGECKO PRICE UNAVAILABLE
    } else if (usdcValue && !coingeckoUsdPrice) {
      return usdcValue
      // BOTH AVAILABLE
    } else if (usdcValue && coingeckoUsdPrice) {
      // take the greater of the 2 values
      return usdcValue.greaterThan(coingeckoUsdPrice) ? usdcValue : coingeckoUsdPrice
    } else {
      return null
    }
  }, [usdcValue, coingeckoUsdPrice])
}
