import { atom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Price, Token } from '@uniswap/sdk-core'

import { USDC } from 'legacy/constants/tokens'

import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

import { fiatPricesAtom, FiatPriceState } from './fiatPricesAtom'

export interface UsdPriceState extends Omit<FiatPriceState, 'price'> {
  price: Price<Token, Token> | null
}

export type UsdPrices = { [tokenAddress: string]: UsdPriceState }

export const usdPricesAtom = atom((get) => {
  const fiatPrices = get(fiatPricesAtom)

  return Object.keys(fiatPrices).reduce<UsdPrices>((acc, tokenAddress) => {
    const fiatPrice = fiatPrices[tokenAddress]

    acc[tokenAddress] = {
      ...fiatPrice,
      price: fiatPrice.price === null ? null : calculatePrice(fiatPrice.currency, fiatPrice.price),
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
