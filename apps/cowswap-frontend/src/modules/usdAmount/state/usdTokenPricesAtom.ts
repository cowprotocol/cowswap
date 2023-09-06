import { atom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Price, Token } from '@uniswap/sdk-core'

import { USDC } from 'legacy/constants/tokens'

import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

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

function calculatePrice(currency: Token, price: string | null): Price<Token, Token> | null {
  if (!price) {
    return null
  }

  const usdcToken = USDC[currency.chainId as SupportedChainId]

  if (price.includes('e') || new RegExp('^0\\.' + '0'.repeat(usdcToken.decimals)).test(price)) {
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
