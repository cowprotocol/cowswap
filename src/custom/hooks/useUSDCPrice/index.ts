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
import { OrderKind } from '@src/custom/state/orders/actions'

export * from '@src/hooks/useUSDCPrice'

const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  ...STABLECOIN_AMOUNT_OUT_UNI,
  [SupportedChainId.XDAI]: CurrencyAmount.fromRawAmount(USDC_XDAI, 10_000e6),
}

export default function useUSDCPrice(currency?: Currency) {
  const [bestUsdPrice, setBestUsdPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const { chainId } = useActiveWeb3React()

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
  }, [amountOut, chainId, currency, stablecoin])

  return { price: bestUsdPrice, error }
}

/**
 * Returns the price in USDC of the input currency from price APIs
 * @param currencyAmount currency to compute the USDC price of
 */
export function useUSDCValue(currencyAmount?: CurrencyAmount<Currency>) {
  const { price, error } = useUSDCPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || error || !currencyAmount) return null

    try {
      return price.invert().quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, error, price])
}
