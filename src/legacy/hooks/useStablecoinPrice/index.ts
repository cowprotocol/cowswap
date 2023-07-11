import { useEffect, useMemo, useRef, useState } from 'react'

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'

import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { Nullish } from 'types'

import { DEFAULT_NETWORK_FOR_LISTS } from 'legacy/constants/lists'
import { USDC } from 'legacy/constants/tokens'
import { useGetGpPriceStrategy } from 'legacy/hooks/useGetGpPriceStrategy'
import { stringToCurrency } from 'legacy/state/swap/extension'
import { useGetGpUsdcPrice } from 'legacy/utils/price'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useWalletInfo } from 'modules/wallet'

import { useGetCoingeckoUsdPrice } from 'api/coingecko'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

export const getUsdQuoteValidTo = () => Math.ceil(Date.now() / 1000) + 600

const STABLECOIN_AMOUNT_OUT: { [chain in SupportedChainId]: CurrencyAmount<Token> } = {
  [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC[SupportedChainId.MAINNET], 100e6),
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
  const strategy = useGetGpPriceStrategy()

  const sellTokenAddress = currency?.wrapped.address
  const sellTokenDecimals = currency?.wrapped.decimals

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
  }, [baseAmount, errorResponse, quoteParams, sellTokenAddress, stablecoin, currency, isStablecoin, quote, strategy])

  return { price: bestUsdPrice, error }
}

interface GetPriceQuoteParams {
  currencyAmount: Nullish<CurrencyAmount<Currency>>
  error: Error | null
  price: Price<Token, Currency> | null
}

// common logic for returning price quotes
function useGetPriceQuote({ price, error, currencyAmount }: GetPriceQuoteParams) {
  return useMemo(() => {
    if (!price || error || !currencyAmount) return null

    try {
      return price.invert().quote(currencyAmount)
    } catch (error: any) {
      return null
    }
  }, [currencyAmount, error, price])
}

/**
 * Returns the price in USDC of the input currency from price APIs
 * @param currencyAmount currency to compute the USDC price of
 */
export function useUSDCValue(currencyAmount: Nullish<CurrencyAmount<Currency>>) {
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

  return { price, error }
}

export function useCoingeckoUsdValue(currencyAmount: Nullish<CurrencyAmount<Currency>>) {
  const coingeckoUsdPrice = useCoingeckoUsdPrice(currencyAmount?.currency)

  return useGetPriceQuote({ ...coingeckoUsdPrice, currencyAmount })
}

export function useHigherUSDValue(currencyAmount: Nullish<CurrencyAmount<Currency>>) {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
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
