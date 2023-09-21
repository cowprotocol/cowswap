import { atom } from 'jotai'

import { USDC } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction, Price, Token } from '@uniswap/sdk-core'

import { usdRawPricesAtom, UsdRawPriceState } from './usdRawPricesAtom'

export interface UsdPriceState extends Omit<UsdRawPriceState, 'price'> {
  price: Price<Token, Token> | null
}

export type UsdPrices = { [tokenAddress: string]: UsdPriceState }

export const usdTokenPricesAtom = atom((get) => {
  const usdPrices = get(usdRawPricesAtom)

  return Object.keys(usdPrices).reduce<UsdPrices>((acc, tokenAddress) => {
    const usdPrice = usdPrices[tokenAddress]

    acc[tokenAddress] = {
      ...usdPrice,
      price: calculatePrice(usdPrice.currency, usdPrice.price),
    }

    return acc
  }, {})
})

const ONE_USDC_ATOM = new Fraction(1, 1_000_000)

function calculatePrice(currency: Token, price: Fraction | null): Price<Token, Token> | null {
  if (!price) {
    return null
  }

  const usdcToken = USDC[currency.chainId as SupportedChainId]

  if (price.lessThan(ONE_USDC_ATOM)) {
    // Less than 1 atom of USDC, cannot create a Price instance
    return null
  }

  const baseAmount = tryParseCurrencyAmount('1', currency)
  const quoteAmount = tryParseCurrencyAmount(price, usdcToken)

  return new Price({
    baseAmount,
    quoteAmount,
  })
}
