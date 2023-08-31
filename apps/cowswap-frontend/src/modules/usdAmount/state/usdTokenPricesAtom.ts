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
      price: usdPrice.price === null ? null : calculatePrice(usdPrice.currency, usdPrice.price),
    }

    return acc
  }, {})
})

function calculatePrice(currency: Token, price: number): Price<Token, Token> {
  const usdcToken = USDC[currency.chainId as SupportedChainId]

  const baseAmount = tryParseCurrencyAmount('1', currency)
  const quoteAmount = tryParseCurrencyAmount(price.toString(), usdcToken)

  return new Price({
    baseAmount,
    quoteAmount,
  })
}
